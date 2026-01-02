#!/usr/bin/env python3
"""
Script para corregir errores de sintaxis en script_new.js
Corrige template strings corruptos: $ { } -> ${}
"""

import re

def fix_file():
    file_path = r"d:\repositorioak\DEADballULTRAMEGA\script_new.js"
    
    print(f"Leyendo {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"Tamaño original: {len(content)} caracteres")
    
    # Corrección 1: Template strings con espacios: $ { variable } -> ${variable}
    content = re.sub(r'\$\s+\{\s+([^}]+?)\s+\}', r'${\1}', content)
    
    # Corrección 2: Optional chaining con espacios: ? . -> ?.
    content = re.sub(r'\?\s+\.', r'?.', content)
    
    # Corrección 3: Atributos HTML con espacios: data - player -> data-player
    content = re.sub(r'data\s+-\s+player', 'data-player', content)
    
    # Corrección 4: Espacios en template strings multi-línea
    content = re.sub(r'`\s+roster\s+-\s+\$\s+\{\s+team\s+\}\s+`', '`roster-${team}`', content)
    content = re.sub(r'`\s+bench-table\s+-\s+\$\s+\{\s+team\s+\}\s+`', '`bench-table-${team}`', content)
    
    # Corrección 5: HTML malformado: < td class = "..." > -> <td class="...">
    content = re.sub(r'<\s+td\s+class\s+=\s+"([^"]+)"\s+>', r'<td class="\1">', content)
    content = re.sub(r'<\s+/td>\s+<', r'</td><', content)
    content = re.sub(r'<\s+option\s+value\s+=\s+"([^"]*)"\s+>', r'<option value="\1">', content)
    content = re.sub(r'<\s+/option>\s+<', r'</option><', content)
    content = re.sub(r'<\s+select\s+class\s+=\s+"([^"]+)"\s+', r'<select class="\1" ', content)
    content = re.sub(r'<\s+/select>\s+<', r'</select><', content)
    
    print(f"Tamaño después de corrección: {len(content)} caracteres")
    
    # Crear backup
    backup_path = file_path + ".backup_before_fix"
    with open(backup_path, 'w', encoding='utf-8') as f:
        # Re-leer el archivo original para el backup
        with open(file_path, 'r', encoding='utf-8') as orig:
            f.write(orig.read())
    print(f"Backup guardado en: {backup_path}")
    
    # Escribir archivo corregido
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Archivo corregido exitosamente!")
    print(f"📝 {file_path}")

if __name__ == "__main__":
    fix_file()
