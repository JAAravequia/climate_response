#!/bin/bash
#
# Abstract: prepare and update forcing data from merged precipitation
#
# 
mmyy=$1
mm=${mmyy:0:2}
yy=${mmyy:2:4} 
rundir=`pwd`
mkdir -p figures 
mkdir -p ./dados_fonte
cd ./dados_fonte
if test -f ../dados_fonte/cams_opi_merged.${yy}${mm}; then  
   echo "Arquivo disponivel! "
   cd $rundir
   `date -d "$mm/01/$yy" +01%b%Y > dd_mmm_yyyy.txt` 
else 
   echo "Arquivo nao local. Verificando a disponivel para download ..."
   wget https://ftp.cptec.inpe.br/clima/pldsdias/cams_opi_merged.ctl
   wget https://ftp.cptec.inpe.br/clima/pldsdias/cams_opi_merged.${yy}${mm}
   if test -f ../dados_fonte/cams_opi_merged.${yy}${mm}; then
      echo "Download feito: "
      ls -l cams_opi_merged.${yy}${mm}
      cd $rundir
      date -d "$mm/01/$yy" +01%b%Y > dd_mmm_yyyy.txt
   else
      cd $rundir
      echo "Arquivo não disponível para "$mmyy" . Tente outra data"
      echo "erro" > dd_mmm_yyyy.txt
   fi 
fi


