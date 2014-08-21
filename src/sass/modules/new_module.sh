#!/bin/bash

usage () {
    echo -e "\nUsage: ./new_module.sh <module_name>";
}

if [[ -z "$1" ]]
then
    echo "Generates the necessary files for a new sass module and adds the @import"
    echo "statments to _acadis.scss and _nsidc.scss."
    usage
    exit 1;
fi

if [[ -d "$1" ]]
then
    echo "Module already exists."
    usage
    exit 1;
fi

mkdir $1

echo -e "// rules for selectors shared between the projects go here\n// different values for the different projects can be configured with variables" > $1/_$1_common.scss
echo -e "// rules for ACADIS-only selectors go here" > $1/_$1_acadis.scss
echo -e "// rules for NSIDC-only selectors go here" > $1/_$1_nsidc.scss

echo -e "\n@import '$1/$1_acadis';\n@import '$1/$1_common';" >> _acadis.scss
echo -e "\n@import '$1/$1_nsidc';\n@import '$1/$1_common';" >> _nsidc.scss
