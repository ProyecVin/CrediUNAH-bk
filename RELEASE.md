1.Actualizar la maquina
 sudo apt-get update
2. Instale los paquetes necesarios para permitir que apt use paquetes a través de HTTPS: 

sudo apt-get install apt-transport-https ca-certificates curl software-properties-common

3. Agregue la clave GPG oficial de Docker: 

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg-dearmor o /usr/share/keyrings/docker-archive-keyring.gpg
 curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg


4. Agregue el repositorio de Docker. 
echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu 
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null 

5. Actualizar e instalar docker 
sudo apt-get update 
sudo apt-get install docker-ce docker-ce-cli containerd.io
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

comandos para crear el doker

1.crea la imagen
docker build -t miapp-node .
2. ver las imagenes
docker images
3. correr la imagen
docker run --env-file .env -p 8000:8000 miapp-node
4. reconstruye la imagen
sudo docker build -t miapp-node .


