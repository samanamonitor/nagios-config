#!/bin/bash

BACKUPDIR=/var/backup
DATE=$(date +%Y%m%d)
if [ ! -d "${BACKUPDIR}"]; then
    mkdir -p ${BACKUPDIR}
fi
find ${BACKUPDIR} -type f -mtime +30 -exec rm -f {} \;
tar -czvf /var/backup/${DATE}nagios.tgz /etc/nagios/objects
