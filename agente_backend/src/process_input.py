# agente_backend/src/gpt_processor.py
import os
from openai import OpenAI
import json
from datetime import datetime, timedelta
import calendar
from dotenv import load_dotenv

load_dotenv()

# Obtenha a chave da API do OpenAI de variáveis de ambiente
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Cliente OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)

def processar_texto(texto, user_id):
    """
    Usa o GPT para processar o texto e extrair informações estruturadas sobre um gasto
    """
    try:
        # Prompt para extrair informações de gasto
        prompt = f"""
        Analise o seguinte texto e extraia informações sobre um gasto financeiro.
        Se não for um gasto, responda com {{"erro": "Não é um gasto"}}.

        Texto: "{texto}"

        Extraia as seguintes informações:
        1. Valor do gasto (número)
        2. Categoria (alimentação, transporte, moradia, lazer, saúde, educação, vestuário, outros)
        3. Data (formato YYYY-MM-DD, use a data atual se não especificada)
        4. Descrição (o próprio texto)

        Responda em formato JSON com as chaves: valor, tipo, data, descricao
        """

        # Chamada para a API do OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # ou gpt-4 se disponível
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # Baixa temperatura para resultados consistentes
            max_tokens=500
        )

        # Extrair resposta
        gpt_response = response.choices[0].message.content.strip()
        
        # Tentar converter para JSON
        try:
            parsed_response = json.loads(gpt_response)
            
            # Sempre definir explicitamente o user_id
            parsed_response["user_id"] = user_id
                
            return parsed_response
            
        except json.JSONDecodeError:
            # Se o GPT não retornar um JSON válido
            return {
                "erro": "Não foi possível processar a resposta do GPT",
                "resposta_raw": gpt_response
            }

    except Exception as e:
        return {"erro": f"Erro ao processar o texto: {str(e)}"}

def processar_consulta(texto, user_id):
    """
    Usa o GPT para interpretar uma consulta sobre gastos
    """
    try:
        hoje = datetime.now()
        
        # Prompt para interpretar consulta
        prompt = f"""
        Analise o seguinte texto como uma consulta sobre gastos financeiros:
        
        Texto: "{texto}"
        
        Data atual: {hoje.strftime('%Y-%m-%d')}
        
        Interprete a consulta e determine:
        1. Período de tempo (diário, semanal, mensal, anual, personalizado)
        2. Categoria específica (se houver)
        3. Datas de início e fim no formato YYYY-MM-DD
        
        Por exemplo:
        - "gastos deste mês" seria o mês atual completo
        - "gastos com alimentação" seria todos os gastos da categoria alimentação
        - "gastos com transporte esta semana" seria gastos de transporte da semana atual
        
        Responda em formato JSON com as chaves: periodo, start_date, end_date, tipo (categoria)
        """

        # Chamada para a API do OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # ou gpt-4 se disponível
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500
        )

        # Extrair resposta
        gpt_response = response.choices[0].message.content.strip()
        
        # Tentar converter para JSON
        try:
            parsed_response = json.loads(gpt_response)
            
            # Sempre definir explicitamente o user_id
            parsed_response["user_id"] = user_id
                
            # Valores padrão para datas se não forem fornecidas
            if "start_date" not in parsed_response or not parsed_response["start_date"]:
                # Padrão: primeiro dia do mês atual
                primeiro_dia_mes = hoje.replace(day=1)
                parsed_response["start_date"] = primeiro_dia_mes.strftime("%Y-%m-%d")
                
            if "end_date" not in parsed_response or not parsed_response["end_date"]:
                # Padrão: último dia do mês atual
                ultimo_dia_mes = hoje.replace(day=calendar.monthrange(hoje.year, hoje.month)[1])
                parsed_response["end_date"] = ultimo_dia_mes.strftime("%Y-%m-%d")
                
            return parsed_response
            
        except json.JSONDecodeError:
            # Se o GPT não retornar um JSON válido
            return {
                "erro": "Não foi possível processar a resposta do GPT",
                "resposta_raw": gpt_response
            }

    except Exception as e:
        return {
            "erro": f"Erro ao processar a consulta: {str(e)}",
            "user_id": user_id,
            "start_date": hoje.replace(day=1).strftime("%Y-%m-%d"),
            "end_date": hoje.replace(day=calendar.monthrange(hoje.year, hoje.month)[1]).strftime("%Y-%m-%d")
        }