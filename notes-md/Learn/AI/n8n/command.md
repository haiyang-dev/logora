docker volume create n8n_data

docker run -d --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n  -e N8N_SECURE_COOKIE=false docker.n8n.io/n8nio/n8n

haiyang.wang@lseg.com

3DWmwzu9yxhqc7F