      PROGRAM RW_CLI
      implicit none
      INCLUDE 'hrzres.i'
      Real*4 valor
      REAL*4  vminu,vmaxu, vminv,vmaxv, vminz,vmaxz
      real*4  matrizu(73,61)
      real*4  FNU(ID,JD),fator
      character*255 NFile,OUTFILE
      integer IND,i,j,exper, narg, OND
      integer external getarg,iargc
       narg=IARGC()
      if(narg.ne.1) then
           write(*,*) 'Uso: curfwrite-new.x MMMAAAA' 
           stop0
      endif   

      call GETARG(1,OUTFILE)
      OND=INDEX(OUTFILE//' ',' ')-1 
      
       WRITE(*,*) 'Leitura da fonte - Escreve em txt, valores >=0'
       ind=0
C       do while(ind.lt.2)
         WRITE(*,*) 'Arquivo a ler : ./tmp_data/src_gauss.bin '
         NFILE='src_gauss'
         IND=INDEX(NFILE//' ',' ')-1 
C 
       Open(10,FILE='./tmp_data/'//NFILE(1:IND)//'.bin',
     *       Status='Old',FORM='UNFORMATTED',recordtype='stream')
       do j=1,60
          do i=1,72
	     read(10) valor
	     if(j.lt.3.or.j.gt.60) then
	       valor=0.0
	     else  
C             if((valor.lt.0.0000001) valor=0.0
	        if(valor.eq.1.70141e+038) valor=0.0
	        if(valor.lt.-99.0 .or. valor.gt.99.0) valor=0.0
C            if(j.lt.11 .or. j.gt.51) valor=0.0
             endif
	     matrizu(i,j)=valor
	  enddo
C	  print *,'Leitura j: ', j
       enddo
       Close(10) 
       Close(11)
C Elimina as bordas indefinidas  U
       vminu=10e17
       vmaxu=-10e17     
       do j=1,JD
          do i=1,ID
	     FNU(i,j)=matrizu(i,j)
	     vminu=min(vminu,matrizu(i,j))
	     vmaxu=max(vmaxu,matrizu(i,j))
	  enddo
C	  print *,'Bordas j: ', j
       enddo
       write(*,*)'Min :',vminu,' Max :',vmaxu
       FATOR = vmaxu / 0.055
       write(*,*)'Fator de normalizacao:' ,FATOR
C       read(*,*) FATOR
       write(*,*)'NOVOS RANGES:'
       write(*,*)'Min :',vminu/FATOR,' Max :',vmaxu/FATOR
       OPEN(77,FILE='./forcante/'//NFILE(1:IND)//OUTFILE(1:OND)//
     *       '.dat',Status='Unknown',FORM='FORMATTED')
       OPEN(78,FILE='./forcante/'//NFILE(1:4)//OUTFILE(1:OND)//
     *    'cut.bin',Status='Unknown',FORM='UNFORMATTED',
     *     access='direct',RECL=ID*JD)
      exper=1
      FNU=FNU/fator
      do j=1,JD
          do i=1,ID
           
             write(77,*) FNU(i,j)
	     exper=exper+1
          enddo
C	  print *,'Escrita j: ', j	  
       enddo
	write(78,REC=1) FNU  !  ((FNU(i,j)/fator,i=1,id),j=1,jd)
       
       close(77)
       close(78)
   
       end
C ---------------------------------------- 
