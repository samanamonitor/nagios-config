#!/bin/bash

install_nagios_config() {
    local TEMPDIR=$(mktemp -d)
    local CURDIR=$(pwd)
    git clone https://github.com/samanamonitor/nagios-config.git ${TEMPDIR}
    cd ${TEMPDIR}
    apt install -y libapache2-mod-wsgi
    pip install flask
    mkdir -p /var/www/nagios_config/nagios_config
    mkdir -p /var/www/nagios_config/html
    cp -R nagios_config/* /var/www/nagios_config/nagios_config/
    cp -R html/* /var/www/nagios_config/html/
    cp nagios_config.wsgi /var/www/nagios_config/
    chown -R www-data.www-data /var/www/nagios_config
    cp etc/apache2/sites-available/nagios-config.conf /etc/apache2/sites-available/
    cd /etc/apache2/sites-enabled/
    ln -s ../sites-available/nagios-config.conf
    cp check_config.sh reload_config.sh /var/www/nagios_config
    chown nagios.nagios /var/www/nagios_config/check_config.sh
    chown root.root /var/www/nagios_config/reload_config.sh
    chmod u+s /var/www/nagios_config/check_config.sh /var/www/nagios_config/reload_config.sh
    cd ${CURDIR}
    rm -Rf ${TEMPDIR}
}

install_nagios_config