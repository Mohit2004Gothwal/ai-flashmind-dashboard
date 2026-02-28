from setuptools import setup, find_packages

setup(
    name="flashmind",
    version="2025.1.0",
    packages=find_packages(),
    install_requires=[
        'tensorflow>=2.6.0',
        'numpy>=1.21.0',
    ],
    python_requires='>=3.8',
)
