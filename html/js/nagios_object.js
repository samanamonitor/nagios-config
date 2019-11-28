class NagiosObject {
    constructor(data) {
        this.name = data.name;
        this.shortname = data.shortname;
        this.id = data.id;
        this.model = data.model;
        this.register = data.register;
        this.inherited_attribute = {};
        this.attribute = {};
        this.effective_attributes = {};
        this.invalid_attributes = {};
        this.modified_attributes = [1];
    }
    _set_shortname(data) {
        return data[data["model"].toLowerCase() + "_name"];
    }

    get_guiname() {
        if(this.shortname == null) {
            return this.name + "(Template)";
        }
        if(this.name == null) {
            return this.shortname;
        }
        return this.shortname + "(" + this.name + ")";
    }

    get_description() {
        return this.name != null ? this.name : 
            this.shortname != null ? this.shortname :
            null;
    }

    row() {
        return $("<div>").addClass("row").html(
            $("<div>").addClass("col")
                .addClass("border")
                .attr("id", this.id)
                .attr("model", this.model)
                .html(this.get_guiname())
                .click(click_list_row)
        );
    }
    info() {
        return { label: this.get_guiname(), data: [
            ["id", this.id],
            ["model", this.model],
            ["name", this.name],
            ["shortname", this.shortname]
            ]};
    }
    append_list_row(row) {
        row.append($("<div>").addClass("row").html(
            $("<div>").addClass("col")
                .addClass("border")
                .attr("data-id", this.id)
                .attr("data-model", this.model)
                .attr("data-name", this.name)
                .attr("data-shortname", this.shortname)
                .attr("id", this.id)
                .attr("model", this.model)
                .html(this.get_guiname())
                .click(click_list_row)));
        return row;
    }
    update(callback) {
        if(this.is_dirty()) {
            var filter = {}
            if(this.shortname != null)
                filter["shortname"] = this.shortname;
            else
                filter["name"] = this.name;
            load_object(this.model, "show", filter, callback);
        } else {
            callback(this);
        }
    }
    load_details(data) {
        if(data == null || !('attributes' in data))
            return;

        for(var a in data.attributes) {
            this._set_inherited(a, data.attributes[a].inherited);
            this._set_override(a, data.attributes[a].override);
        }
        for(var a in data.effective_attributes) {
            this.effective_attributes[a] = data.effective_attributes[a];
        }
        this.modified_attributes = [];
    }


    html_attribute_dropdown(location) {
        var options = $("<div>")
                .addClass("dropdown-menu")
                .attr("id", "add_attribute_menu")
                .attr("aria-labelledby", "add_attribute");
        for(var a in this.valid_attributes) {
            var attribute_name = this.valid_attributes[a];
            if(Object.keys(this.attribute).includes(attribute_name) || 
                Object.keys(this.inherited_attribute).includes(attribute_name))
                continue
            options.append($("<a>")
                .addClass("dropdown-item")
                .attr("href", "#")
                .click(add_attribute_row)
                .html(attribute_name));
        }
        location.html($("<div>")
            .addClass("dropdown")
            .append($("<button>")
                .addClass("btn btn-secondary dropdown-toggle")
                .attr("type", "button")
                .attr("id", "add_attribute")
                .attr("data-toggle", "dropdown")
                .attr("aria-haspopup", "true")
                .attr("aria-expanded", "false")
                .html("Select attribute to add..."))
            .append(options));
        return location;
    }
    append_detail_row(attribute, list) {
        var row = $("<div>").addClass("row");
        // label
        row.append($("<div>").addClass("col").html(
            $("<label>").attr("for", "attr_" + attribute)
                .html(attribute)));

        // input value
        row.append($("<div>").addClass("col").html(
            $("<input>").addClass("form-control")
                .change(change_attribute)
                .attr("id", "val_" + attribute)));

        // override checkbox
        row.append($("<div>").addClass("col").html(
            $("<input>").addClass("form-check-input")
                .attr("type", "checkbox")
                .attr("id", "overr_" + attribute)
                .change(change_override))
            .append(
                $("<label>").addClass("form-check-label")
                    .attr("for", "overr_" + attribute)
                    .html("(override)")));
        list.append(row);
        return list;
    }
    html_override(attribute_list) {
        attribute_list.html("");
        for(var attribute in this.attribute) {
            var val = this.attribute[attribute];

            this.append_detail_row(attribute, attribute_list);
            attribute_list.find("#val_" + attribute)
                .val(val)
                .removeAttr("disabled");
            attribute_list.find("#overr_" + attribute)
                .attr("checked", 1);
        }
        return attribute_list;
    }
    html_inherited(attribute_list) {
        attribute_list.html("");
        for(var attribute in this.inherited_attribute) {
            if(Object.keys(this.attribute).includes(attribute)) {
                continue;
            }
            var val = this.inherited_attribute[attribute];

            this.append_detail_row(attribute, attribute_list);
            attribute_list.find("#val_" + attribute)
                .attr("value", val)
                .attr("disabled", 1);
        }
        return attribute_list;
    }
    append_a_object_name(location) {
        location.append($("<a>")
                        .attr("href", "#")
                        .html(this.get_guiname())
                        .data("id", this.id)
                        .data("model", this.model)
                        .data("name", this.name)
                        .data("shortname", this.shortname)
                        .off("click")
                        .click(show_family))
                        .append($("<br>"));
        return location;
    }
    html_effective(location) {
        location.html("");
        var ea = this.effective_attributes;
        var o;
        for(var a in ea) {
            var value = $("<div>").addClass("col");
            var model;
            if(a.startsWith("parents") || a.startsWith("children"))
                model = this.model;
            else if(a == "contact_groups" || a == "contactgroups")
                model = "Contactgroup";
            else if(a == "contacts")
                model = "Contact";
            else if(a == "hostgroups")
                model = "Hostgroup";
            else if(a == "check_command")
                model = "Command";
            else if(a == "hosts")
                model = "Host";
            else if(a == "services")
                model = "Service";
            else if(a == "servicegroups")
                model = "Servicegroup";
            if(Array.isArray(ea[a])) {
                for(var item in ea[a].sort()) {
                    o = get_object(model, ea[a][item]);
                    if(o == null)
                        o = get_object("T_" + model, ea[a][item]);
                    if(o != null)
                        o.append_a_object_name(value);
                    else 
                        value.append(ea[a][item]);
                }
            } else {
                o = get_object(model, ea[a]);
                if(o != null)
                    o.append_a_object_name(value);
                else
                    value.append(ea[a]);
            }
            var e = $("<div>").addClass("row border-bottom")
                .append($("<div>").addClass("col-3")
                    .html(a))
                .append(value);
            location.append(e);
        }
    }
    html_actions(actions) {
        actions.html(a_modal("save", "Save"))
            .append(a_modal("discard", "Discard"))
            .append(a_modal("delete", "Delete"))
            .append(a_modal("copy", "Copy"));
        //this.html_attribute_dropdown(actions);
        return actions;
    }
    set(attribute, value) {
        this._set_override(attribute, value);
    }

    _set_inherited(attribute, value) {
        this._set_value(attribute, value, true);
    }

    _set_override(attribute, value) {
        this._set_value(attribute, value, false);
        if(!this.modified_attributes.includes(attribute)) {
            this.modified_attributes.push(attribute);
        }
    }

    _set_value(attribute, value, inherited) {
        if(value == null) {
            return;
        }
        if(!(this.valid_attributes.includes(attribute)) && 
            !attribute.startsWith("_")) {
            this.invalid_attributes[attribute] = value;
            return;
        }
        if(inherited) {
            this.inherited_attribute[attribute] = value;
        } else {
            this.attribute[attribute] = value;
        }
    }

    get(attribute, inherited) {
        if(attribute in this.attribute && 
            (inherited == null || inherited == false))
            return this.attribute[attribute];
        if(attribute in this.inherited_attribute)
            return this.inherited_attribute[attribute];
        return "";
    }
    is_dirty() {
        return this.modified_attributes.length != 0;
    }
}

class NagiosHost extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "2d_coords",
            "3d_coords",
            "action_url",
            "active_checks_enabled",
            "address",
            "alias",
            "check_command",
            "check_freshness",
            "check_interval",
            "check_period",
            "contact_groups",
            "contacts",
            "display_name",
            "event_handler",
            "event_handler_enabled",
            "first_notification_delay",
            "flap_detection_enabled",
            "flap_detection_options",
            "freshness_threshold",
            "high_flap_threshold",
            "host_name",
            "hostgroups",
            "icon_image",
            "icon_image_alt",
            "initial_state",
            "low_flap_threshold",
            "max_check_attempts",
            "name",
            "notes",
            "notes_url",
            "notification_interval",
            "notification_options",
            "notification_period",
            "notifications_enabled",
            "obsess_over_host",
            "parents",
            "passive_checks_enabled",
            "process_perf_data",
            "register",
            "retain_nonstatus_information",
            "retain_status_information",
            "retry_interval",
            "stalking_options",
            "statusmap_image",
            "use",
            "vrml_image",
        ];
        this.load_details(data);
    }

}
class NagiosHostgroup extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "action_url",
            "alias",
            "hostgroup_members",
            "hostgroup_name",
            "members",
            "name",
            "notes",
            "notes_url",
            "register",
            "use",
        ];
        this.load_details(data);
    }
}
class NagiosService extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "action_url",
            "active_checks_enabled",
            "check_command",
            "check_freshness",
            "check_interval",
            "check_period",
            "contact_groups",
            "contacts",
            "display_name",
            "event_handler",
            "event_handler_enabled",
            "first_notification_delay",
            "flap_detection_enabled",
            "flap_detection_options",
            "freshness_threshold",
            "high_flap_threshold",
            "host_name",
            "hostgroup_name",
            "icon_image",
            "icon_image_alt",
            "initial_state",
            "is_volatile",
            "low_flap_threshold",
            "max_check_attempts",
            "name",
            "notes",
            "notes_url",
            "notification_interval",
            "notification_options",
            "notification_period",
            "notifications_enabled",
            "obsess_over_service",
            "passive_checks_enabled",
            "process_perf_data",
            "register",
            "retain_nonstatus_information",
            "retain_status_information",
            "retry_interval",
            "service_description",
            "servicegroups",
            "stalking_options",
            "use",
        ];
        this.load_details(data);
    }
    _set_shortname(data) {
        return data["service_description"];
    }
}
class NagiosServicegroup extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "action_url",
            "alias",
            "members",
            "name",
            "notes",
            "notes_url",
            "register",
            "servicegroup_members",
            "servicegroup_name",
            "use",
        ];
        this.load_details(data);
    }
}
class NagiosContact extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "address",
            "alias",
            "can_submit_commands",
            "contact_name",
            "contactgroups",
            "email",
            "host_notification_commands",
            "host_notification_options",
            "host_notification_period",
            "host_notifications_enabled",
            "name",
            "pager",
            "register",
            "retain_nonstatus_information",
            "retain_status_information",
            "service_notification_commands",
            "service_notification_options",
            "service_notification_period",
            "service_notifications_enabled",
            "use",
        ];
        this.load_details(data);
    }
}
class NagiosContactgroup extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "alias",
            "contactgroup_members",
            "contactgroup_name",
            "members",
            "name",
            "register",
            "use",
        ];
        this.load_details(data);
    }
}
class NagiosCommand extends NagiosObject {
    constructor(data) {
        super(data);
        this.valid_attributes = [
            "command_line",
            "command_name",
            "name",
            "register",
            "use",
        ];
        this.load_details(data);
    }
}
