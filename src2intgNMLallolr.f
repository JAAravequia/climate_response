C  Objetivo
C  --------
C  Faz a integral da fonte pela funcao de influencia (funcao de Green)
C  para recuperar a resposta.
C
C  Autor: Aravequia, J.A.
C  -----
C   
C  RESUMO:
C  -------
C
C   1)  Le a forcante que esta' gravada em formato binario do arquivo 
C       ./NFILE.bin OBS.: NFILE e' passado via parametro
C
C   2)  Zera os valores da fonte fora da area dada 
C              pelo namelist ./limites-forcante.nml
C
C   3)  Grava a fonte selecionada no arquivo ../climate/NFILE-ok.bin 
C       em binario e no arquivo ./NFILE-ok.dat em ASC
C
C   4)  Le as funcoes de influencia do arquivo 
C      ./FI/semSzero/'//cmes//'/phn0080hr',
C       enquanto calcula a integral OBS.: cmes e' passado via parametro
C
C   5)  Grava a resposta calculada no arquivo: phn0080hr.intg
C  

      PROGRAM src2intg
      implicit none
      INCLUDE 'hrzres.i'
      Real*4 valor
      REAL*4 vminu,vmaxu, vminv,vmaxv, vminz,vmaxz
      real*4 fonte(72,60)
      real*4 FNU(ID,JD),FNZ(ID,JD),FNZ1(ID,JD),INTEGR(ID,JD),fator
      real*4 LAT(JD)
      character*255 NFile, fileFInflu
      character*10 cmes
      integer IND,INDfi,INDM,i,j,exper,ii,jj,iid,jjd
      integer ILN,ILX,JLN,JLX, narg, OND
      integer external getarg,iargc
      DATA LAT/-87.723,-84.772,-81.805,-78.833,-75.860,-72.886,
     *        -69.912,-66.938,-63.963,-60.988,-58.013,-55.039,-52.064, 
     *        -49.089,-46.114,-43.139,-40.164,-37.189,-34.214, -31.238, 
     *        -28.263,-25.288,-22.313,-19.338,-16.363,-13.388, -10.413,  
     *         -7.438, -4.463, -1.488,  1.488,  4.463,  7.438,  10.413,  
     *         13.388, 16.363, 19.338, 22.313, 25.288, 28.263,  31.238,
     *         34.214, 37.189, 40.164, 43.139, 46.114, 49.089,  52.064,  
     *         55.039, 58.013, 60.988, 63.963, 66.938, 69.912,  72.886,
     *         75.860, 78.833, 81.805, 84.772, 87.723/
      NAMELIST /AREA_LIM/ ILN,ILX,JLN,JLX
      
       narg=IARGC()
      if(narg.ne.2) then
           write(*,*) 'Uso: src2intgNML.x src_MMMAAAcut mes_fi'
	   write(*,*) 'Onde mes_fi = [ Jan Abr Jul Out ... ]' 
           stop0
      endif   
       ind=0

      call GETARG(1,NFILE)
      IND=INDEX(NFILE//' ',' ')-1 
      call GETARG(2,cmes)
      INDM=INDEX(cmes//' ',' ')-1 
      
      OPEN(55,FILE='./limites-forcante.nml',STATUS='OLD')
      READ(55,AREA_LIM)
      CLOSE(55)
      print *,'Limites da forcante: ',ILN,ILX,JLN,JLX
       WRITE(*,*) 'Leitura da fonte - Escreve em txt, valores >=0'
C       do while(ind.lt.2)
C         WRITE(*,*) 'Arquivo a ler (sem ext. Ex: src_012001cut [.bin])'
C         READ(*,'(A)') NFILE
C         IND=INDEX(NFILE//' ',' ')-1 
C 
       Open(10,FILE=NFILE(1:IND)//'.bin', Status='Old'
     *      ,FORM='UNFORMATTED', access='direct',RECL=ID*JD)
       read(10,REC=1) FNU                 !((FNU(I,J),i=1,ID),j=1,JD)
       exper=0
       do j=1,60
          do i=1,72
	           valor=FNU(I,J)
	           exper=exper+1
	           if(j.lt.JLN .or. j.gt.JLX .or. i.lt.ILN .or. i.gt.ILX)then
	              valor=0.0
	           else  
C             if((valor.lt.0.0000001) valor=0.0
	               if(valor.eq.1.70141e+038) valor=0.0
	               if(valor.lt.-99.0 .or. valor.gt.99.0) valor=0.0
C            if(j.lt.11 .or. j.gt.51) valor=0.0
             endif
	           fonte(i,61-j)=valor
	        enddo
       enddo
       Close(10) 
C Elimina as bordas indefinidas  U
       vminu=10e34
       vmaxu=-10e34     
       do j=1,60
          do i=1,72
	           vminu=min(vminu,fonte(i,j))
	          vmaxu=max(vmaxu,fonte(i,j))
	        enddo
       enddo
       write(*,*)'Min :',vminu,' Max :',vmaxu
       OPEN(77,FILE='./'//NFILE(1:IND)//'ok.dat',
     *       Status='Unknown',FORM='FORMATTED')
        OPEN(78,FILE='./'//NFILE(1:IND-3)//'ok.bin',
     *       Status='Unknown',FORM='UNFORMATTED',
     *       access='direct',RECL=(ID*(JD-18)))
       exper=0
C       do j=10,JD-9
       do j=1,JD
          do i=1,ID
	     exper = exper + 1
             write(77,*) fonte(i,j)
          enddo
       enddo
       write(78,REC=1) ((fonte(i,j),i=1,ID),j=10,JD-9)
       print *,'Numero de pontos forcantes :',exper
       close(77)
       close(78)
       write(*,*)'Mes das FIs escolhido :>>>>>>> ',cmes
       
       fileFInflu='./FI/semSzero/'//cmes(1:INDM)//'/phn0080hr'
       INDfi=index(fileFInflu//' ',' ')-1 
       print *, 'Abrindo F.I. file: ',trim(fileFInflu)
       if(cmes.eq.'Jan'.or.cmes.eq.'Abr'.or.cmes.eq.'Out') then
C         OPEN(77,FILE='/home/araveq/barotropico/Linux/FI/semSzero/'
C     *                 //cmes(1:INDM)//'/phn0080hr',
         OPEN(77,FILE=trim(fileFInflu),
     *        CONVERT='BIG_ENDIAN',Status='Unknown',
     *        FORM='UNFORMATTED',ACCESS='DIRECT',RECL=ID*JD)
       else
        OPEN(77,FILE=trim(fileFInflu),   
     *        Status='Unknown',FORM='UNFORMATTED',
     *        ACCESS='DIRECT',RECL=ID*JD)
       endif
       exper=0
       print *,'Integrando F.I.s com campo forcante de OLR...'
       do i=1,ID
          do j=10,JD-9
	     exper = exper + 1
C	     if(.not.(J.eq.51.and.I.gt.70))then
            READ(77,REC=exper,ERR=777)((FNZ(iid,jjd),iid=1,72),jjd=1,60)
             if(exper.eq.1) FNZ1=FNZ
             do jj=1,JD
	        do ii=1,ID
	          INTEGR(ii,jj)=INTEGR(ii,jj)+fonte(i,j)*FNZ(ii,jj)
     *	                                *COS(LAT(j)*3.141592/180.0)
		enddo
	     enddo
	  enddo
C	  print *,'J=',j
       enddo
  777  print *,'I=',i,' J=',j     
        print *,'Gerando binario com resultado : phn0080hr.intg'
       OPEN(78,FILE='phn0080hr.intg',ACCESS='DIRECT',
     *       Status='Unknown',FORM='UNFORMATTED',RECL=ID*JD)
       Write(78,REC=1) ((INTEGR(iid,jjd),iid=1,72),jjd=1,60)  
       write(78,REC=2) ((fonte(iid,jjd),iid=1,72),jjd=1,60)   
       close(77)
       close(78)
       print *,'Gerou arquivo ',exper
C       de forcante!'
       end
C ---------------------------------------- 
