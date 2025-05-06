def gerar_dicas_personalizadas(user_id, gastos_atuais, gastos_anteriores, categoria_principal, projecao, meta):
    """
    Gera dicas personalizadas com base nos dados do usuário
    
    Args:
        user_id: ID do usuário
        gastos_atuais: Lista de gastos do período atual
        gastos_anteriores: Lista de gastos do período anterior
        categoria_principal: Dict com informações da categoria principal
        projecao: Valor projetado para o final do período
        meta: Meta mensal do usuário
        
    Returns:
        Lista de dicas personalizadas
    """
    dicas = []
    
    # Dica baseada na categoria principal
    if categoria_principal["nome"] != "nenhuma" and categoria_principal["valor"] > 0:
        dicas.append({
            "tipo": "categoria",
            "texto": f"Sua maior despesa é com {categoria_principal['nome']}, representando {categoria_principal['porcentagem']}% dos seus gastos. Considere verificar se há oportunidades para economizar nessa área."
        })
    
    # Dica baseada na projeção vs meta
    if projecao > meta:
        dicas.append({
            "tipo": "meta",
            "texto": f"Sua projeção de gastos para este mês está {round(((projecao - meta) / meta) * 100, 1)}% acima da sua meta. Tente reduzir gastos nas próximas semanas."
        })
    elif projecao < meta * 0.7:  # Se estiver bem abaixo da meta (menos de 70%)
        dicas.append({
            "tipo": "meta",
            "texto": f"Você está usando apenas {round((projecao / meta) * 100, 1)}% da sua meta mensal. Continue assim!"
        })
    
    # Dica baseada na comparação com mês anterior
    total_atual = sum(gasto["valor"] for gasto in gastos_atuais)
    total_anterior = sum(gasto["valor"] for gasto in gastos_anteriores) if gastos_anteriores else 0
    
    if total_anterior > 0 and total_atual > 0:
        variacao = ((total_atual - total_anterior) / total_anterior) * 100
        
        if variacao > 20:  # Se aumentou mais de 20%
            dicas.append({
                "tipo": "comparacao",
                "texto": f"Seus gastos aumentaram {round(variacao, 1)}% em relação ao mês anterior. Reveja seu orçamento para identificar áreas de redução."
            })
        elif variacao < -20:  # Se diminuiu mais de 20%
            dicas.append({
                "tipo": "comparacao",
                "texto": f"Parabéns! Você reduziu seus gastos em {abs(round(variacao, 1))}% em relação ao mês anterior. Continue mantendo esse controle."
            })
    
    # Dica baseada em categorias que cresceram muito
    if gastos_anteriores:
        categorias_anteriores = {}
        for gasto in gastos_anteriores:
            if gasto["tipo"] not in categorias_anteriores:
                categorias_anteriores[gasto["tipo"]] = 0
            categorias_anteriores[gasto["tipo"]] += gasto["valor"]
        
        categorias_atuais = {}
        for gasto in gastos_atuais:
            if gasto["tipo"] not in categorias_atuais:
                categorias_atuais[gasto["tipo"]] = 0
            categorias_atuais[gasto["tipo"]] += gasto["valor"]
        
        # Encontrar categoria que mais cresceu
        maior_aumento = None
        maior_percentual = 0
        
        for cat, valor_atual in categorias_atuais.items():
            if cat in categorias_anteriores and categorias_anteriores[cat] > 0:
                percentual = ((valor_atual - categorias_anteriores[cat]) / categorias_anteriores[cat]) * 100
                if percentual > 50 and percentual > maior_percentual:  # Aumentou mais de 50%
                    maior_percentual = percentual
                    maior_aumento = cat
        
        if maior_aumento:
            dicas.append({
                "tipo": "aumento_categoria",
                "texto": f"Seus gastos com {maior_aumento} aumentaram {round(maior_percentual, 1)}% em relação ao mês anterior. Verifique o que causou esse aumento."
            })
    
    # Limitar a 2 dicas para não sobrecarregar a interface
    return dicas[:2]