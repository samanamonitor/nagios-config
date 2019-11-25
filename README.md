# Nagios Configuration Tool

This tool has been created to manage Nagios configurations.
It will load configuration from /etc/nagios directory
and use all the objects defined in pynag.

Requirements:
- pynag branch from samanamonitor
- python flask

Installation instructions:
```
pip install virtualenv
mkdir -p /var/www/nagios_config/nagios_config
mkdir -p /var/www/nagios_config/html
cd /var/www/nagios_config/nagios_config
virtualenv venv
source venv/bin/activate
cd venv
git clone https://github.com/samanamonitor/pynag.git
cd pynag
python setup.py build
python setup.py install
cd ..
git clone https://github.com/samanamonitor/nagios-config.git
cp nagios-config/
``` 
