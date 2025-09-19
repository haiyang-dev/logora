[https://docs.anaconda.com/miniconda/miniconda-install/](https://docs.anaconda.com/miniconda/miniconda-install/)

mkdir -p ~/miniconda3

wget [https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh](https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh) -O ~/miniconda3/miniconda.sh

bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3

rm -rf ~/miniconda3/miniconda.sh

~/miniconda3/bin/conda init bash

~/miniconda3/bin/conda init zsh

source ~/.bashrc or source ~/.zshrc

create venv

conda create -n ai_assist python=3.10

conda activate ai_assist

conda deactivate ai_assist

list envs

conda env list