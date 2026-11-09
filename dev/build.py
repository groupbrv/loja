#!/usr/bin/env python3
"""Monta template.html (fonte, com /*CATALOGO*/) e index.html (com o catálogo de reserva embutido)."""
import json, os, sys
d = os.path.dirname(os.path.abspath(__file__))
partes = [open(os.path.join(d, p), encoding='utf-8').read() for p in ('parte1.html', 'parte2.html', 'parte3.js', 'parte4.js')]
tpl = ''.join(partes)
assert tpl.count('/*CATALOGO*/') == 1
cat = json.load(open(os.path.join(d, 'catalogo.json'), encoding='utf-8'))
out = os.path.join(d, '..')
open(os.path.join(out, 'template.html'), 'w', encoding='utf-8').write(tpl)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(tpl.replace('/*CATALOGO*/', json.dumps(cat, ensure_ascii=False, separators=(',', ':'))))
print('ok', len(tpl), 'bytes de código')
