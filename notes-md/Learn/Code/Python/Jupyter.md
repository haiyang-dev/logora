## JupyterLab

Install JupyterLab with pip:

```
pip install jupyterlab

```

**Note**: If you install JupyterLab with conda or mamba, we recommend using [the conda-forge channel](https://conda-forge.org/).

Once installed, launch JupyterLab with:

```
jupyter-lab

```

## Jupyter Notebook

Install the classic Jupyter Notebook with:

```
pip install notebook

```

To run the notebook:

```
jupyter notebook
```

生成html

jupyter nbconvert --to html --no-input C:\\Users\\U6079496\\PycharmProjects\\workspace_test\\draw-cyq.ipynb

```python
jupyter server --generate-config
jupyter server password

nohup jupyter lab --port=8889 --no-browser --ip=0.0.0.0 > jupyterlab.log 2>&1 &
```