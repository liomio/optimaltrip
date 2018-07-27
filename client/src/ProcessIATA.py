import csv
import json

iata_codes = []
with open('airport-codes.csv') as f:
    reader = csv.DictReader(f)
    iata_codes = [r for r in reader if (r['type'] == 'large_airport')]
    print(iata_codes)

with open('codes.json', 'w') as out:
    json.dump(iata_codes, out, indent=2)

dropdown_options = []
with open('dropdownOptions.json', 'w') as out:
    for airport in iata_codes:
        if(airport['iata_code'] != ''):
            code = airport['iata_code']
            name = airport['name']
            location = airport['municipality']
            text = name + ' (' + code + ') - ' + location
            option = {}
            option['key'] = text
            option['text'] = text
            option['value'] = airport
            dropdown_options.append(option)
    json.dump(dropdown_options, out, indent=2)
    
