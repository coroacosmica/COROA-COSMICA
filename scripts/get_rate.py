import urllib.request
import json

try:
    url = 'https://api.exchangerate-api.com/v4/latest/EGP'
    response = urllib.request.urlopen(url)
    data = json.loads(response.read().decode('utf-8'))
    egp_to_eur = data['rates']['EUR']
    print(f'1 EGP = {egp_to_eur} EUR')
    print(f'1 EUR = {1/egp_to_eur} EGP')
except Exception as e:
    print(f'Error: {e}')
