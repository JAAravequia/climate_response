* gera um arquivo com anomalia de olr para ser processado 
* e usado somente valores negativos (conveccao acima da media).

**'open /home/climalis/g_escala/g_escala.ctl'
**
** Arquivos disponiveis em  https://ftp.cptec.inpe.br/clima/pldsdias/ ou no NIS em /oper/share/clima/dist/pldsdias
**

** define data, verifica forçante e faz download se disponivel
**
** say 'Qual a data (Ex.: 01jun2024) da anomalia de precipitacao?'
defmmyy='F'


while (defmmyy="F")
   say 'Qual o mes e ano (Ex.: 062024 , para junho de 2024) da anomalia de precipitacao?'
   pull mmyy
   '!./get_forcing.sh 'mmyy
   rc=read('dd_mmm_yyyy.txt')
   data=sublin(rc,2)
   say data
   if (data!="erro")
      defmmyy="T"
   endif
   say "Dados para forçante encontrados para "data
endwhile

'open ./dados_fonte/cams_opi_merged.ctl'
'set time 'data
say result
'set display color white'
'set grads off'
'c'
'set x 1 144'
'set y 1 72'
*'set lat -80 80'
*'set lon 1.25 360' 
say result
'd comba' 
'set gxout fwrite'
*'set fwrite src'%data%'.bin'

*'set fwrite ./tmp_data/src-tmp.bin'
*say result
*'d comba'
*say result
*'disable fwrite'
*'set gxout shaded'
*'close 1'
*say result

*say 'Estimando a fonte de calor a partir da precipitação ...  ./tmp_data/src-tmp.bin  ...' 
** resolução 2.5° x 2.5°
*say '!./prec2src-allprec.x'
*'!./prec2src-allprec.x'

*say 'Convertendo grade regular para grade gaussiana do modelo da agua rasa ...'
** usa : ./tmp_data/srcpr.pos-tmp.ctl'
*'open ./tmp_data/srcpr.pos-tmp.ctl'

*'set lat -80 80'
** 'define srcgauss=regrid2(src,72,60,gg_bs)'
** re(expr,nx,'linear',lon,dlon,ny,'gaus',gstart,njog, ['ig',nyig],['ba'|'bl'|'bs'|'vt',vtmax,vtmin|'ma',min]
* 
'define srcgauss=re(comba,72,'linear',0,5,60,'gaus',1,60,'bs')'

say result

'set gxout fwrite'
*'set x 1 72'
*'set y 1 60'
'set lat -87.72 87.72'
'set lon 0 355'
'set fwrite ./tmp_data/src_gauss.bin'
say result
'd srcgauss'
say result
'disable fwrite'
say result
'set gxout shaded'

*
* retira o j=1 (90S) e o j=62 (90N) e retira a ultima coluna i=73 (360E)
say ' Retira j=61 e i=73 ...'
say '!./cutfwrite-allprec.x '%substr(data,3,7)

'!./cutfwrite-allprec.x 'substr(data,3,7)
*
dset='DSET ^src_'%substr(data,3,7)%'cut.bin' 
rec=write('ctl.tmp',dset)
rec=close('ctl.tmp')
'!cat ctl.tmp ctl_base.ctl > ./forcante/srcOLRcut'substr(data,3,7)'.ctl'

*
* seleciona uma area da forcante e integra com Funcoes de Influencia 
prompt 'Entre o mes do estado basico da FI ( Jan / Abr / Jul / Out / Feb09 ) :> '
mesfi=chooseFI()
** pull mesfi

say 'run integrFI-allolr.gs 'substr(data,3,7)' 'mesfi
'close 1'
* ***'run integrFI-allolr.gs 'substr(data,3,7)' 'mesfi

forcante=substr(data,3,7)
*
*  ======== Integra a resposta forçada ========
rc = integr(forcante,mesfi)
*  ============================================

**===== Botoes parar continuar ========
function stop()
   resptmp='s'
   'set button 1 13 1'
   
   'draw button 18 8.50 0.75 1.2 0.25 Continue'
   'draw button 19 8.50 0.45 1.2 0.25 STOP'
   
* enquanto nao escolhe continuar ou para ...
   
   umbt=0
   opcCnt=0
   while(umbt<1 | opcCnt<18 | opcCnt>19)
     'q bpos'
     say result
      umbt=subwrd(result,6)
      if(umbt>0)
         opcCnt=subwrd(result,7)
      endif
   endwhile
   if(opcCnt=19)
     resptmp='n'
   endif
return resptmp

**==========================================================
function integr(args,cmes) 
resp='s'
**args=subwrd(arg_tot,1)
**cmes=subwrd(arg_tot,2)
if(cmes='')
  say ' >>>>>>>>>   E R R O   <<<<<<<<<'
  say 'Use grads -lc "run integrFI.gs jun1995 mes_FI"'
  say 'Onde mes_FI :  Jan / Abr / Jul / Out '
  return 
endif
say ' -----------------------------'
say 'Mes das FIs ( Jan / Abr / Jul / Out ) >>> 'cmes

nmctl='./forcante/srcOLRcut'args'.ctl'
prompt 'Abrindo o arquivo da forçante -> ' 

say nmctl
while(resp='s')
   'set display color white'
   'clear'
   
   'open 'nmctl
   resp='s'
   maxpts=91
   lislats='-87.72 -84.77 -81.80 -78.83 -75.86 -72.89 -69.91 -66.94 -63.96 -60.99 -58.01 -55.04 -52.06 -49.09 -46.11 -43.14 -40.16 -37.19 -34.21 -31.24 -28.26 -25.29 -22.31 -19.34 -16.36 -13.39 -10.41 -7.44 -4.46 -1.49  1.49  4.46  7.44 10.41 13.39 16.36 19.34 22.31 25.29 28.26 31.24 34.21 37.19 40.16 43.14 46.11 49.09 52.06 55.04 58.01 60.99 63.96 66.94 69.91 72.89 75.86 78.83 81.80 84.77 87.72'
   ilon=0
   lislons=''
   while(ilon<72)
      lonat=ilon*5
      lislons=lislons%' '%lonat
      ilon=ilon+1
   endwhile

  'set grads off'
  'set mpdset brmap_mres'
  'set grid off'
  'set parea 1 10 0.1 8.5'
  
  'set map 2 1 5'
  'set xlopts 2'
  'set ylopts 2'
  'set annot 2 6'
  
  'set x 1 72'
  'set xaxis 1 72'
  'set y 1 60'
  'set yaxis 1 60'
  'set gxout shaded'
  'set black -0.005 0.005'
  'd src'
   'query gxinfo'
    rec2 = sublin(result,2)
    rec3 = sublin(result,3)
    rec4 = sublin(result,4)
    xsiz = subwrd(rec2,4)
    ysiz = subwrd(rec2,6)
    xlo = subwrd(rec3,4)
    ylo = subwrd(rec4,4)
    xhi = subwrd(rec3,6)
    yhi = subwrd(rec4,6)
    dx = xhi - xlo 
    dy = yhi - ylo
  x=xlo+dx/72.0
  y=ylo+dy/60.0
  'set line 15 1 3'
  ix=1 
  while (ix<=72)
    'q gr2xy 'ix' 1'
    xi=subwrd(result,3)
    yi=subwrd(result,6)
  
    'q gr2xy 'ix' 60'
    yf=subwrd(result,6)
  
    'draw line 'xi' 'yi' 'xi' 'yf
    ix = ix + 1
  endwhile

   iy=1
   while (iy<=60)
     'q gr2xy 1 'iy
     xi=subwrd(result,3)
     yi=subwrd(result,6)
   
     'q gr2xy 72 'iy
     xf=subwrd(result,3)
   
     'draw line 'xi' 'yi' 'xf' 'yi
     iy = iy + 1
   endwhile
   
   ipt=1
   listanpt=''
   listaip=''
   listajp=''
   
   'draw title Selecione a fonte arrastando o apontador sobre o campo'
   'gxprint sec-fonte.png'
   
   say '---------' 
   'run zoomFI.gs'
   explim=sublin(result,1)
   explim=subwrd(explim,1)

   say 'Limites do exp.:'explim
**
**   recorta somente a area selecionada da fonte (apenas zera o restante)
**   e grava em asc
**
   say '!./src2intgNMLallolr.x ./forcante/src_'args'cut 'cmes
   '!./src2intgNMLallolr.x ./forcante/src_'args'cut 'cmes
   'c'
   'close 1'
   'open pn80int.ctl'

   'set map 1 1 5'
   'set xlopts 1 5 0.15'
   'set ylopts 1 5 0.15'
   'set ylint 20'
   'set clopts 1  5 0.15'
   'set annot 1 6'
   'set dfile 1' 
   'set lat -60 60'
   'set gxout shaded'
   'set cmin -0.1' 
   'set cmax  0.1' 
   'set black -0.005 0.005'
   'd src(t=1)' 
   'run colorbar 0.7 0 5.51 1.96'
   'set gxout contour' 
   'd pn(t=1)'
   'set cmin -0'
   'set cmax 0'
   'set cthick 6'
   'd pn(t=1)'
 
   titulo='Geop. 200 hPa - Integral da F.I. de 'cmes' \ Forcante de 'args

   'draw title 'titulo
   namefig='figures/IntFI-'cmes'-srcOLR-'args'_'explim'.png'
   'gxprint 'namefig' png x1100 y850 '
   say result
   prompt 'Figura gerada : '
   say namefig

   say ' --------------------'
   say 'Continua (s/n) - Click na Janela Grafica para Continuar'
*   === botoes para continuar ou STOP   
   resp=stop()
   say '<Ctrl + C> para encerrar'

   'reinit'

endwhile

return



**--------------------------
* Display e escolha do mes
**--------------------------
function chooseFI()
   
   'draw string 2.0 0.60 Escolha a climatologia do estado basico'
   meses='Jan Abr Jul Out'
   
   'set button 1 11 1'
   ib=1
   bxi=2.5
   byi=0.35
   while(ib<=4)
     bttexto=subwrd(meses,ib)
     'draw button 'ib' 'bxi' 'byi' 0.75 0.25 'bttexto
     ib=ib+1
     bxi= bxi + 0.8
   endwhile
   
* enquanto nao escolhe um dos meses ...
   umbt=0
   opcMes=0
   while(umbt<1|opcMes<3)
     'q bpos'
     say result
      umbt=subwrd(result,6)
      if(umbt>0)
         opcMes=subwrd(result,7)
      endif
   endwhile
   
   say "Botao escolhido : "opcMes
   'set button 2 11 15 1 2 11 15 2 6'
   bttexto=subwrd(meses,opcMes)
   'redraw button 'opcMes' 0 1 'bttexto
   say "mes escolhido :: "bttexto
   mes=opcMes-2
   mesfi=subwrd(meses,opcMes)
   'redraw button 'opcMes' 0 1 'mesfi
   say "mes escolhido :: "mesfi
   chooseFI=mesfi
   
return mesfi
