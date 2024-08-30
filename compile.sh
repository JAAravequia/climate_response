#!/bin/bash
#
# ## Compilação dos programas fortran necessários  

 ifort -static cutfwrite-allprec.f -o cutfwrite-allprec.x
 ifort -static src2intgNMLallolr.f -o src2intgNMLallolr.x

 
