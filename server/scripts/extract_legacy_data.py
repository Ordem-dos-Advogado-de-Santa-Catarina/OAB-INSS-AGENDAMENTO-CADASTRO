
import re
import json
import sys
import os

def extract_data_from_sql(sql_file_path):
    if not os.path.exists(sql_file_path):
        raise FileNotFoundError(f"Arquivo não encontrado: {sql_file_path}")

    with open(sql_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    extracted_data = {
        'usuarios': [],
        'agendamentos': [],
        'bloqueios': []
    }

    # Extrair dados de usuarios
    usuarios_match = re.search(r'INSERT INTO `usuarios` \(`id`, `cpf_oab`, `nome`, `email`, `telefone`, `nivel`, `oab`, `criado_em`\) VALUES\n(.*?)(?=\n\n--|\Z)', content, re.DOTALL)
    if usuarios_match:
        lines = usuarios_match.group(1).strip().split('),\n\t(')
        for line in lines:
            line = line.strip().replace('(', '').replace(')', '')
            parts = re.findall(r"'((?:[^']|\\')*)'|NULL|(\d+)", line)
            
            processed_parts = []
            for p in parts:
                if p[0] is not None and p[0] != '': # Se for uma string (grupo 1 do regex)
                    processed_parts.append(p[0].replace("\\\'", "'"))
                elif p[1] is not None and p[1] != '': # Se for um número (grupo 2 do regex)
                    processed_parts.append(int(p[1]))
                else: # Se for NULL ou string vazia que não foi capturada pelo grupo 1
                    processed_parts.append(None)
            
            # Ajustar para o número correto de colunas esperado
            # id, cpf_oab, nome, email, telefone, nivel, oab, criado_em
            if len(processed_parts) >= 8:
                extracted_data['usuarios'].append({
                    'id': processed_parts[0],
                    'cpf_oab': processed_parts[1],
                    'nome': processed_parts[2],
                    'email': processed_parts[3],
                    'telefone': processed_parts[4],
                    'nivel': processed_parts[5],
                    'oab': processed_parts[6],
                    'criado_em': processed_parts[7]
                })

    # Extrair dados de agendamentos
    agendamentos_match = re.search(r'INSERT INTO `agendamentos` \(`id`, `id_usuario`, `telefone_contato`, `id_agenda`, `motivo`, `observacao`, `data_agendamento`, `hora_inicio`, `hora_fim`, `status`, `motivo_cancelamento`, `data_cancelamento`, `status_atendimento`, `criado_em`\) VALUES\n(.*?)(?=\n\n--|\Z)', content, re.DOTALL)
    if agendamentos_match:
        lines = agendamentos_match.group(1).strip().split('),\n\t(')
        for line in lines:
            line = line.strip().replace('(', '').replace(')', '')
            parts = re.findall(r"'((?:[^']|\\')*)'|NULL|(\d+)", line)
            
            processed_parts = []
            for p in parts:
                if p[0] is not None and p[0] != '':
                    processed_parts.append(p[0].replace("\\\'", "'"))
                elif p[1] is not None and p[1] != '':
                    processed_parts.append(int(p[1]))
                else:
                    processed_parts.append(None)
            
            # id, id_usuario, telefone_contato, id_agenda, motivo, observacao, data_agendamento, hora_inicio, hora_fim, status, motivo_cancelamento, data_cancelamento, status_atendimento, criado_em
            if len(processed_parts) >= 14:
                extracted_data['agendamentos'].append({
                    'id': processed_parts[0],
                    'id_usuario': processed_parts[1],
                    'telefone_contato': processed_parts[2],
                    'id_agenda': processed_parts[3],
                    'motivo': processed_parts[4],
                    'observacao': processed_parts[5],
                    'data_agendamento': processed_parts[6],
                    'hora_inicio': processed_parts[7],
                    'hora_fim': processed_parts[8],
                    'status': processed_parts[9],
                    'motivo_cancelamento': processed_parts[10],
                    'data_cancelamento': processed_parts[11],
                    'status_atendimento': processed_parts[12],
                    'criado_em': processed_parts[13]
                })

    # Extrair dados de bloqueios
    bloqueios_match = re.search(r'INSERT INTO `bloqueios` \(`id`, `id_agenda`, `tipo`, `data_bloqueio`, `data_fim_bloqueio`, `hora_inicio_bloqueio`, `hora_fim_bloqueio`, `motivo_bloqueio`, `criado_em`\) VALUES\n(.*?)(?=\n\n--|\Z)', content, re.DOTALL)
    if bloqueios_match:
        lines = bloqueios_match.group(1).strip().split('),\n\t(')
        for line in lines:
            line = line.strip().replace('(', '').replace(')', '')
            parts = re.findall(r"'((?:[^']|\\')*)'|NULL|(\d+)", line)
            
            processed_parts = []
            for p in parts:
                if p[0] is not None and p[0] != '':
                    processed_parts.append(p[0].replace("\\\'", "'"))
                elif p[1] is not None and p[1] != '':
                    processed_parts.append(int(p[1]))
                else:
                    processed_parts.append(None)
            
            # id, id_agenda, tipo, data_bloqueio, data_fim_bloqueio, hora_inicio_bloqueio, hora_fim_bloqueio, motivo_bloqueio, criado_em
            if len(processed_parts) >= 9:
                extracted_data['bloqueios'].append({
                    'id': processed_parts[0],
                    'id_agenda': processed_parts[1],
                    'tipo': processed_parts[2],
                    'data_bloqueio': processed_parts[3],
                    'data_fim_bloqueio': processed_parts[4],
                    'hora_inicio_bloqueio': processed_parts[5],
                    'hora_fim_bloqueio': processed_parts[6],
                    'motivo_bloqueio': processed_parts[7],
                    'criado_em': processed_parts[8]
                })

    return extracted_data

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python3 extract_legacy_data.py <caminho_para_inss.sql>")
        sys.exit(1)

    sql_file = sys.argv[1]
    output_json_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'legacy_data.json')
    
    try:
        data = extract_data_from_sql(sql_file)
        with open(output_json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f'Dados extraídos e salvos em {output_json_file}')
    except FileNotFoundError as e:
        print(f"Erro: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")
        sys.exit(1)
