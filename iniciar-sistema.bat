@echo off
echo ==========================================
echo      INICIANDO O SISTEMA MYMECHANIC
echo ==========================================
echo.
echo Parando containers antigos...
docker-compose down

echo.
echo Construindo e subindo a aplicacao (Isso pode demorar um pouco na primeira vez)...
echo.
docker-compose up --build

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause