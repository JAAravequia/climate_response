function zoom(var)
'q gxinfo'
xdf = sublin(result,3)
ydf = sublin(result,4)
x0 = subwrd(xdf,4)
xf = subwrd(xdf,6)
y0 = subwrd(ydf,4)
yf = subwrd(ydf,6)
say 'set rband 21 box 0 0 1 1' 
loc=0
while(loc = 0)
'set rband 21 box 1 1 10 8' 
'q pos'
say result
loc = subwrd(result,6)
if(loc = 0)
   'q dims'
   lodf = sublin(result,2)
   lon0 = subwrd(lodf,6)
   lonx = subwrd(lodf,8)
   ldf = sublin(result,3)
   lat0 = subwrd(ldf,6)
   latx = subwrd(ldf,8)
   dlon = lonx - lon0
   dlat = latx - lat0
*   'set lon 'lon0-dlon/4' 'lonx+dlon/4
*   'set lat 'lat0-dlat/4' 'latx+dlat/4
else
   xgt = subwrd(result,3)
   ygt = subwrd(result,4)
   xgtx = subwrd(result,8)
   ygtx = subwrd(result,9)
   btn = subwrd(result,5)


   'q xy2gr 'xgt' 'ygt
    say result
    i0 = subwrd(result,3)
    j0 = subwrd(result,6)
   'q xy2gr 'xgtx' 'ygtx
    if0 = subwrd(result,3)
    jf0 = subwrd(result,6)
     
    i0=math_int(i0)
    j0=math_int(j0)
    if0=math_int(if0)
    jf0=math_int(jf0)

*    i0=substr(i0,1,2)
*    j0=substr(j0,1,2)
*    if0 = substr(if0,1,2)
*    jf0 = substr(jf0,1,2)
    
   if(i0 > if0) 
     int = if0
     if0 = i0
     i0 = int
   endif
   if(j0 > jf0)
     int = jf0
     jf0 = j0
     j0 = int
   endif


    iexpi = 1
    iexpf = 72
    jexpi = 10
    jexpf = 51
    experi = (i0-1)*(jexpf-jexpi+1) + j0 -jexpi +1 
    experf= (if0-1)*(jexpf-jexpi+1) + jf0 -jexpi +1 
    explim=i0'-'if0'_'j0'-'jf0
    say 'Experimento inicial : 'experi'  (I0:'i0',  J0:'j0')' 
    say 'Experimento final : 'experf'    (IF:'if0',  JF:'jf0')'

    rec=write('./limites-forcante.nml',' &AREA_LIM')
    rec=write('./limites-forcante.nml','  ILN = '%i0,append)
    rec=write('./limites-forcante.nml','  ILX = '%if0,append)
    rec=write('./limites-forcante.nml','  JLN = '%j0,append)
    rec=write('./limites-forcante.nml','  JLX = '%jf0,append)
    rec=write('./limites-forcante.nml',' &END',append) 
    res=close('./limites-forcante.nml')

   'q xy2w 'xgt' 'ygt
   lon0 = subwrd(result,3)
   lat0 = subwrd(result,6)
   'q xy2w 'xgtx' 'ygtx
   lonx = subwrd(result,3)
   latx = subwrd(result,6)
   if(lat0 > latx) 
     int = latx
     latx = lat0
     lat0 = int
     int = ygtx
     ygtx =ygt
     ygt = int
   endif
   if(lon0 > lonx)
     int = lonx
     lonx = lon0
     lon0 = int
     int = xgtx
     xgtx =xgt
     xgt = int
   endif
*   'set lon 'lon0' 'lonx
*   'set lat 'lat0' 'latx
   say 'set lon 'lon0' 'lonx
   say 'set lat 'lat0' 'latx
endif
say ' LOC = ' loc
EOlon0='E'
EOlonx='E'
EOlat0='N'
EOlatx='N'
if(lon0<0); EOlon0='W';endif
if(lonx<0); EOlonx='W';endif
if(lat0<0); EOlat0='S';endif
if(latx<0); EOlatx='S';endif

'set line 2 1 6'
'draw rec 'xgt' 'ygt' 'xgtx' 'ygtx
'set line 4 1 6'
'draw rec 'xgt+0.05' 'ygt+0.05' 'xgtx-0.05' 'ygtx-0.05
nmgif='intFI-forc-'lon0%EOlon0'-'lonx%EOlonx'_'lat0%EOlat0'-'latx%EOlatx
endwhile
if(var) 
*   'clear'
*  'display 'var
endif
return explim' 'experi' 'experf'  name >> 'nmgif
