# Nagios Configuration Tool

This tool has been created to manage Nagios configurations.
It will load configuration from /etc/nagios directory
and use all the objects defined in pynag.

Requirements:
- pynag branch from samanamonitor
- apache2

Installation instructions:
```
sudo apt install -y libapache2-mod-wsgi
pip install flask
sudo mkdir -p /var/www/nagios_config/nagios_config
sudo mkdir -p /var/www/nagios_config/html
sudo cp -R nagios_config/* /var/www/nagios_config/nagios_config/
sudo cp -R html/* /var/www/nagios_config/html/
sudo cp nagios_config.wsgi /var/www/nagios_config/
sudo cp etc/apache2/sites-available/nagios-config.conf /etc/apache2/sites-available/ 
cd /etc/apache2/sites-enabled/  
sudo ln -s ../sites-available/nagios-config.conf 
sudo systemctl restart apache2
``` 
