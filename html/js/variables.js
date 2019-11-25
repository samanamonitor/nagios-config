var objects={};
var tabs = [ "Hostgroup", 
    "Host", 
    "Service", 
    "Contactgroup", 
    "Contact", 
    "Command", 
    "Servicegroup" 
    ];
var model_attrs = {
    "timeperiod": {
        "timeperiod_name": {
            "type": "string"
        },
        "alias": {
            "type": "string"
        },
        "exclude": {
            "type": "string"
        },
    },
    "servicedependency": {
        "dependent_host_name": {
            "type": "string"
        },
        "dependent_hostgroup_name": {
            "type": "string"
        },
        "servicegroup_name": {
            "type": "string"
        },
        "dependent_servicegroup_name": {
            "type": "string"
        },
        "dependent_service_description": {
            "type": "string"
        },
        "host_name": {
            "type": "string"
        },
        "hostgroup_name": {
            "type": "string"
        },
        "service_description": {
            "type": "string"
        },
        "inherits_parent": {
            "type": "boolean"
        },
        "execution_failure_criteria": {
            "type": "options",
            "options": {
               "o": "OK",
               "w": "WARNING",
               "u": "UNKNOWN",
               "c": "CRITICAL",
               "p": "PENDING",
               "n": "NONE" 
            }
        },
        "notification_failure_criteria": {
            "type": "options",
            "options": {
               "o": "OK",
               "w": "WARNING",
               "u": "UNKNOWN",
               "c": "CRITICAL",
               "p": "PENDING",
               "n": "NONE" 
            }
        },
        "dependency_period": {
            "type": "string"
        },
    },
    "serviceescalation": {
        "host_name": {
            "type": "string"
        },
        "hostgroup_name": {
            "type": "string"
        },
        "service_description": {
            "type": "string"
        },
        "contacts": {
            "type": "string"
        },
        "contact_groups": {
            "type": "string"
        },
        "first_notification": {
            "type": "number"
        },
        "last_notification": {
            "type": "number"
        },
        "notification_interval": {
            "type": "number"
        },
        "escalation_period": {
            "type": "string"
        },
        "escalation_options": {
            "type": "options",
            "options": {
                "w": "WARNING",
                "u": "UNKNOWN",
                "c": "CRITICAL",
                "r": "RECOVERY"
            }
        },
    },
    "hostdependency": {
        "dependent_host_name": {
            "type": "string"
        },
        "dependent_hostgroup_name": {
            "type": "string"
        },
        "host_name": {
            "type": "string"
        },
        "hostgroup_name": {
            "type": "string"
        },
        "inherits_parent": {
            "type": "boolean"
        },
        "execution_failure_criteria": {
            "type": "options",
            "options": {
                "o": "UP",
                "d": "DOWN",
                "u": "UNREACHABLE",
                "p": "PENDING",
                "n": "NONE"
            }
        },
        "notification_failure_criteria": {
            "type": "options",
            "options": {
                "o": "UP",
                "d": "DOWN",
                "u": "UNREACHABLE",
                "p": "PENDING",
                "n": "NONE"
            }
        },
        "dependency_period": {
            "type": "string"
        },
    },
    "hostescalation": {
        "host_name": {
            "type": "string"
        },
        "hostgroup_name": {
            "type": "string"
        },
        "contacts": {
            "type": "string"
        },
        "contact_groups": {
            "type": "string"
        },
        "first_notification": {
            "type": "number"
        },
        "last_notification": {
            "type": "number"
        },
        "notification_interval": {
            "type": "number"
        },
        "escalation_period": {
            "type": "string"
        },
        "escalation_options": {
            "type": "options",
            "options": {
                "d": "DOWN",
                "u": "UNREACHABLE",
                "r": "RECOVERY"
            }
        },
    },
};

