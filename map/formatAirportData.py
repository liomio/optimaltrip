import json
from decimal import Decimal

with open('../client/src/codes.json') as f:
  data = json.load(f)

iata_code = {}
for i in data:
  iata = i['iata_code']
  latLong = i['coordinates'].replace(' ','').split(',')
  iata_code[iata] = latLong

with open('codes.json', 'w') as out:
  json.dump(iata_code, out, indent=2)
