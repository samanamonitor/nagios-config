from flask import render_template, request
from nagios_config import app
from pynag import Model
from flask import jsonify
import json
import subprocess
from pynag.Control.Command import send_command


class APIOutput:
    def __init__(self, function=None, query=None):
        self._status = "error"
        self._message = "Unknown Error"
        self._data = None
        self._function = function
        self._query = query

    def success(self, msg="Action succesfull", data=None):
        self._status = "ok"
        self._message = msg
        self._data = data

    def error(self, msg="Unknown Error"):
        self._status = "error"
        self._message = msg

    def set(self, attribute, value):
        setattr(self, "_" + attribute, value)
        return value

    def jsonify(self):
        return jsonify({
                    'status': self._status,
                    'message': self._message,
                    'data': self._data,
                    'function': self._function,
                    'query': self._query
                    })

class APIModel:
    def __init__(self, model_name="Host"):
        self._model = self.set_model(model_name.lower())

    def set_model(self, model_name):
        m = model_name.lower()
        if m not in Model.string_to_class:
            raise Exception("Invalid model")
        self._model = Model.string_to_class[m]
        return self._model

    def get_model(self):
        return self._model

out = APIOutput()
apimodel = APIModel()

@app.route('/', methods=['POST'])
def pn_query():
    req_model = request.json.get('model', None)
    req_function = request.json.get('function', None)
    elements = request.json.get('elements', get_elements(req_model))
    query = request.json.get('query', {})
    out.set("function", req_function)
    out.set("query", query)
    try:
        if req_function not in api_functions:
            raise Exception("Invalid function")
        function = api_functions[req_function]

        function(req_model=req_model, elements=elements, query=query)

    except Exception as e:
        print e
        out.error(e.message)

    finally:
        return out.jsonify()

def check_config(**kwargs):
    process = subprocess.Popen(['/var/www/nagios_config/check_config.sh'],
                         stdout=subprocess.PIPE, 
                         stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

    if process.returncode == 0:
        out.success(stdout)
    else:
        raise Exception(stdout)


def reload_config(**kwargs):
    send_command("RESTART_PROGRAM")
    out.success("Reloaded")

def update_object(req_model=None, elements=None, query={}):
    model = apimodel.set_model(req_model)
    o_id = query.get('id')
    if o_id is None:
        out.error('Copy will only work with id')
        return
    del query['id']

    o = model.objects.get_by_id(o_id)
    for a, v in query.items():
        if a == 'id': continue
        if v is None:
            o.set_attribute(a, v)
        else:
            o.set_attribute(a, v.encode('ascii', 'ignore'))
    o.save()
    out.success("Updated", data={ 'id': o.get_id() })

def delete_object(req_model="", elements=None, query={}):
    model = apimodel.set_model(req_model)
    o_id = query.get('id')
    if o_id is None:
        raise Exception('Copy will only work with id')
    o = model.objects.get_by_id(o_id)
    o.delete()
    out.success('Object deleted')

def copy_object(req_model="", elements=None, query={}):
    model = apimodel.set_model(req_model)
    o_id = query.get('id')
    if o_id is None:
        raise Exception('Copy will only work with id')
    del query['id']

    model_name = req_model.lower()
    shortname = query.get(model_name + "_name")
    name = query.get("name")
    if shortname is None and name is None:
        raise Exception('A new name/%s_name must be defined' % model_name)

    if name is not None and len(model.objects.filter(name=name)) > 0:
        raise Exception('Duplicate object exist with name %s' % name)
    if shortname is not None and len(model.objects.filter(shortname=name)) > 0:
        raise Exception('Duplicate object exist with shortname %s' % shortname)

    o = model.objects.get_by_id(o_id)
    if model_name != 'service':
        if len(model.objects.filter(**query)) > 0:
            raise Exception('Object with same shortname already exists')
        
    for key, value in query.items():
        query[key] = value.encode('ascii', 'ignore')

    new_o = o.copy(filename=o.get_filename(), **query)
    out.success('Saved', data={ 'id': new_o[0].get_id() } )

def list_object(req_model="", elements=None, query={}):
    model = apimodel.set_model(req_model)
    ol = model.objects.filter(**query)

    os = []
    for o in ol:
        od = { 'model': type(o).__name__ }
        for e in elements:
            od[e] = o.get(e)
        os += [ od ]
    out.success("Success", data=os)

def show_object(req_model="", elements=None, query={}):
    model = apimodel.set_model(req_model)
    ol = model.objects.filter(**query)
    if len(ol) > 1:
        raise Exception('More than one record found')
    if len(ol) < 1:
        raise Exception('No records found.')
    o = ol[0]

    config = { 
        'attributes': {}, 
        'effective_attributes': {}
    }
    effective_attrs = config['effective_attributes']
    for t in o.get_attribute_tuple():
        (key, override, inherited) = t
        if override is not None:
            override = override if ',' not in override else override.split(',')
        if inherited is not None:
            inherited = inherited if ',' not in inherited else inherited.split(',')
        config['attributes'][key] = {'override': override, 'inherited': inherited }
    for func_name in dir(o):
        if not func_name.startswith('get_effective'): continue
        attr_name = func_name[len("get_effective_"):]
        func = "o." + func_name
        if attr_name == "parents" or attr_name == "children":
            effective_attrs[attr_name] = get_effective(eval(func), recursive=False)
            temp = get_effective(eval(func), recursive=True)
            effective_attrs[attr_name + '_indirect'] = [ x for x in temp if x not in effective_attrs[attr_name] ]
        else:
            effective_attrs[attr_name] = get_effective(eval(func))
    config['model'] = type(model()).__name__
    config['filename'] = o.get_filename()
    config['id'] = o.get_id()
    config['shortname'] = o.get_shortname()
    config['name'] = o.name
    out.success("Success", data=config)


def get_effective(get_effective_func, **kwargs):
    c = []
    try:
        eff = get_effective_func(**kwargs)
    except:
        return { 'error': 'Unable to execute effective function' }
    if isinstance(eff, list) or isinstance(eff, set):
        for e in eff:
            if isinstance(e, Model.ObjectDefinition):
                c += [ e.get_id() ]
            else:
                c += [ str(e) ]
    elif isinstance(eff, str):
        c = eff
    elif isinstance(eff, Model.ObjectDefinition):
        c = eff.get_id()
    return c

def get_elements(req_model=""):
    if req_model is None: return None
    model = req_model.lower()
    if model == "service":
        return [ "id", "name", "service_description", "shortname", "register" ]
    return [ "id", "name", model + "_name", "shortname", "register" ]
            

api_functions = {
    "check": check_config,
    "reload": reload_config,
    "update": update_object,
    "delete": delete_object,
    "copy": copy_object,
    "list": list_object,
    "show": show_object
}

