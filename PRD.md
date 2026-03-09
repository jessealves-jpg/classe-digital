# PRD - App de Organização Estudantil EAD

## Visão Geral
Criar um aplicativo de organização de aulas EAD que funcione por meio de conversas em linguagem natural.  
O objetivo é ter horários de aulas estilo em uma instituição presencialmente, onde o aluno informa qual o horário inicial das aulas
e as aulas ou curso a qual esta participando, esse aplicativo ter o campo onde marca o tempo e os cursos que o aluno quer estudar diariamente e fazer um calculo semanal dividindo inteligentemente um tempo ideal por curso
diariamente até dar o prazo estipulado por dia.

## Problema a Resolver
Muitos alunos não conseguem ter concentração para estudar em casa, e abandonam o curso ou fazem sem foco, pois nao mantém uma constancia e a falta de fóco só posterga o conhecimento.  
Queremos resolver isso com uma experiência conversacional fluida e recomendações automáticas que se adaptam ao perfil do usuário, como o própio app dará dias de trilhas sobre determinado assunto a ser estudado
 (uma trilha e um passi a passo para estimular o aluno)

## Público-Alvo
Pessoas que desejam ter fóco e uma trilha de estudos bem elaborada — 

## Funcionalidades-Chave
1. Registro de usuario (logim e senha) + validação por email
2. cadastro de todos os cursos que o usuario esta matriculado
3. Definição e acompanhamento de metas estudantil: O usuário pode criar metas como “concluir o curso até...”.
4. Dicas personalizadas do Agente Estudantil: Um assistente virtual que sugere formas de estudos ou dicas sobre duvidas com base nos cursos do usuário.
5. Relatórios simples e personalizados: Visualizações claras dos cursos mais estudados, metas e progresso, adaptadas ao estilo do usuário.
6. Geração de gráficos de aplicações por curso.
7. Gráficos de conclusão.
8. Configurações: tema escuro ou claro, troca de senha e acessibilidade.
9. Opção de apagar histórico de conversas do chat.
10. Criar ou apagar metas (mantendo formatação do usuário).
11. Integração com hiperlink dos cursos matriculados.
12. Campo com blocos para anotações em cada curso matriculado.
13. Exportação para Excel/Google Sheets.
14. Alertas inteligentes (quando o curso não atingir a meta diaria).
15. Calculo de tempo estudado. (diario, semanal e anual)
16. Perfis de relatórios personalizáveis (minimalista, detalhado, visual).
17. Criptografia ponta a ponta para dados sensíveis.
24. Controle granular de histórico (apagar seletivamente).
25. Educação Esudantil integrada: 

## Princípio de Design Universal
A solução será construída com base em Design Universal, garantindo que o aplicativo ofereça uma experiência acessível, intuitiva e inclusiva para o maior número possível de pessoas —
 independentemente de idade, nível de alfabetização digital, limitações físicas ou cognitivas.  

Isso inclui:
- Interface clara e legível  
- Navegação simples e sem sobrecarga de informações  
- Compatibilidade com leitores de tela e comandos por voz  
- Feedbacks visuais e auditivos para facilitar o uso  
- Login e senha obrigatórios para acesso  

## Entregável da IA
Gerar um plano de MVP contendo:
- As principais telas (Matérias, metas, relatórios, configurações)  
- Recursos técnicos necessários (NLP, categorização automática, motor de recomendações, integração bancária, criptografia)  
- Estratégia de validação inicial com usuários reais (testes com grupos pequenos, coleta de feedback, ajustes rápidos)  
- Linguagem acessível e tom educativo, em português  
- Aplicação dos princípios de Design Universal desde o protótipo  

------------------------------------------------------------

Correções a serem realizadas:1

-Altere o nome do curso para Classe Digital ok
-Habilite os campos para criar metas ou exluir metas ok
-Habilite os campos para cadastrar novos cursos ok
-Habilite o campo Agenda para poder ajustar o horario inicial ok
-Habilite o sabado e o domingo ( se o usuario estudar nesses dias contabilize como tempo extra de estudo FDS)ok
-Iniciar o App sempre na tela de cadastro - logim e senha
-Crie um icone na tela inicial onde tenha a ver com o objetivo do app ok
-Informe de acordo com o logim do usuaruio - Boa tarde! - Boa noite! - Bom dia! ok
-Se o usuário cadastrar Ex: 15 cursos, perguntar quais são os prioritarios e mesclar eles na agenda semanal ok

Correções a serem realizadas:2

-Salvar todos as mudanças criadas pelo usuario ok
-Contabilizar o tempo do curso realizado quando o usuario clicar no link do curso ok **
-habilitar para edição de informações todos os cursos cadastrados ok
-criar um campo de relátórios interativos ok
-habilitar todos os campos criados ok
-Habilitar o campo tema escuro / claro ok 
-Habilitar o campo alterar senha ok
-Habilitar o campo limpar histórico ok
-Em cada curso deixar um campo para marcar em qual parte o aluno parou de estudar naquele dia ok
-Tocar um alarme a cada termino do tempo estipulado para estudo **
-Criar um campo para informar quantos cursos realizar no dia e ajustar a Agenda semanal ok
- diariamente deixar uma mensagem motivacional na telas de login ok



-
Correção a serem realizadas :3 

1- deixar todos os campos flutuantes onde o usuario possa movimentar e organizar de acordo suas preferencias **
2- cliar um campo de logout - tela inicial ok
3- na tela de configuraçoes criar um campo Perfil ok
4- No cadastro do curso prazo final ter a opção (Concluir até Invalid Date)ok
5- Deixar os campos flutuantes para o usuario poder clicar segurar e arrastar para qualquer canto da tela **
6- Na agenda semanal sempre montar um plano de estudo de acordo com a prioridade do curso escolhido pelo usuario ok
7- Na agenda semanal habilidar um campo onde o usuario vai escolher quais cursos estudar nesse ok
8- Na aba curso - criar um campo exibir onde organize os dados por: grade - lista - icones grandes - icones pequenos - blocos ok
9- Na aba curso - criar um campo classificar por : ordem crescente - ordem decrecente ok
10- mudar o nome do campo Dashboard para Painel inerativo ok
11- No campo total de cursos: habilitar e ao clicar o usuario tem a lista com o nome de todos os cursos cadastrados ok
12- No campo Esta semana mostrar o dia em numeral mensal junto com o dia da semana ok
13- Na tela de boas vindas onde esta escrito Olá, Jessé : habilitar para o usuario escolher e subir qualquer foto de wallpaper ok
14- Criar um campo com a inicial do nome do usuario e com a foto ok
15- Na tela agenda semanal: Separar a parte que tem o nome dos cursos da parte  semanais ok
16- Habilitar no perfil do usuario o campo foto para o usuario poder carregar a foto do perfil ok
17- Quando estiver com o tema escuro, alterar a cor da fonte numerica do campo horas/dia para preto ou cinza igual o campo Cursos/dia ok
18- Ajustar o tamanho para o acesso em tablet, celular e pc **
19- Ajustar a tela inicial com logim e senha e cadastro de novos usuarios- ok
-------------------------------------------------------------------
Correção a serem realizadas 4 

1- No campo Matérias: ao cadastrar o curso, criar o campo progresso onde o usuario vai escolher se o curso é por Horas / Módulos / Aulas - ok
2- CArga horária habilidar o campo: Sem prazo definino ou com prazo definido ok
3- Ajustar o campo carga horária para horas e minutos ok
4- Ajustar o campo hofas concluídas para horas e minutos ok
5- Ao lado do nome do curso o usuario podera escolher a imagem de acordo com o perfil do curso ( ou seja, com o link do site do curso o sistema puxa a imagem do perfil do site) **
6- No painel interativo criar a opçao de Exibir: Grade Lista Icone grande e icones pequenos  e Classificar de AZ ok
7- Ao escolher a foto de fundo do campo de boas vindas, deixar o usuario ajustar e centralizar a foto ok mas precisa melhorar
8- Criar um campo onde possa ser alterado a cor geral do app ok
9- Ajustar automaticamente a cor do texto de boas vindas de acordo com a cor da imagem escolhida pelo usuario Ex: imagem clara, texto escuro, imagem escura texto claro. ok
10- Ajustar a cor dos icones quando o app estiver com tema escuro ok 
11- corrigir as informaçoes do grafico Distribuiçao de Estudo - Estao todas uma sobre a outra. Crie um grafico mais interativo e durante o cadastro dos cursos nao deixar uma informação sobre a outra ok
12- crie um campo para categorisar os cursos por área EX: TI : Python, Bootcamp Avanade, Java para iniciantes Etc. - Adm:: Exel, Word etc. - DAdos: SQL, Python, PowerBI, Exel ok
13- Clicar e arrastar abas ou icones e movimentar para onde o usuario desejar **
---------------------------------------------------
  correção 5
1- No campo Configuraçoes da Agenda: Com o tema escuro clarear a cor do icone relógio que tem dentro do campo onde informa o horário inicial e clarear as setas dos campos todal horas / dia  ecursos / dia
2- alterar o formato para o acesso a celular. (esta desproporcional quando o acesso é pelo celular fica desconfigurado. 
3- A aba inicial tem que etar na parte superior e os icones quando clicados devem habilitar na parte de baixo do app para celular
4- Crie um campo para exibir ou armazenar certificados de cursos concluidos
5- Diverssifique a paleta de cores para os cursos na aba relatórios
6- Diverssifique a paleta de cores para os cursos na aba Matérias
7- Habilite outras funcionalidades na area Categoria como a opção do usuário criar uma nova categoria para os cursos
8- Criar um campo onde possa classificar ou agrupar o curso por Instituição
9- Criar um menu de favoritos
10- Corrigir o acesso e o cadastro de novos usuarios
11- Valiar por email e salvar no banco de dados, todos novos usuarios
12- Salvar cadastro realizados pelo usuario ao fazer o logof
13- criar temas para modificar o visual do app EX: Entre a aba com o nome Classe digital(lado esquero) e a Aba onde mostra os icones abertos (lado direito) mostrar uma aspiral simulando um caderno sendo folheado.
mas mantem o tema original e outros temas para possiveis trocas
14- Habilitar o campo abaixo da tela de boas vindas para poder colocar uma imagem de fundo deixando as informaçoes sobrepor a imagem
15- Criar um campo onde possa mudar para o idioma (ingles)
16- No campo relatório mostrar o iconene com o simbolo do curso (simbolo de acordo com link da plataforma) EX: Curso com link do youtube = simbolo do youtube
17- Crie um campo para cadastrar o GitHub, e o Linkedin
18- Habilite o ajuste com zoon para ajustar o tamanho da foto da tela de boas vindas 
19- Deixe o campo tela boas vindas na mesma proporção que tem a tela de capa do linkedin
20- No campo Perfil: Criar campo: email, Nome 
--------------------------------------

correção 6

-habilitar o campo imagem de fundo
-Na verssao para PC: ajustar a tela de boas vindas para a borda nao ficar desproporcional com o resto da tela
-Na versao para tablet ajustar a tela de boa vindas para a borda nao ficar maior e nao precisar de uma barra de rolagem na parte inferior
-Na versao para celular ajustar proporcionalmente para nao ficar muito grande todos os nomes, todos os icones, e na parte com os menus ajustar para mostrar os campos
 (Painei interativo, Materia,favorito,metas,agenda,relatorios,certificados,assistente,configuraçoes)
Em todas as plataformas deixar organizado da seguinte sequencia: Painel interativo, Materias, Agenda, Relatórios, assistentes, metas, certificados e Configuraçoes.
- Quando o usuario fornecer o link do curso, baixar automaticamente as informaçoes sobre, módulo, e quantidade de horas, ou caso for do youtube: calcular a quantidade de videos que 
contem na playlist e a quantidade de horas de todos os videos. 
Caso nao de para contar as horas de todos os videos da playlist, contar quantas video aulas possui a playlist e preencher o campo aulas
-Apos cadastrar o gitHub e o linkedim, mostar o igone com hiperlink na tela painel interativo
- A haba de navegação da classe digital onde tem os menus interativos, nao esta alterando para o tema claro
-----------------------------------------------------
Correção  7 

-Ao cadastrar o curso - ele sendo da mesma instituição, a cor da borda sempre sera a mesma para o curso baseado na instituição
-Ao adicionar o certificado, mostrar ele dentro da parte que tem um desenho de uma medalha com uma fita
-O usuario podera informar a quantidade de módulos e quando ele mudar para o campo aulas ou horas, o valor informado em cada aba de progresso, nao deve ser excluido em nenhuma aba, ou nao deve ser igualado automaticamente
Ex: Horas: 180, Módulos 7, Aulas 40 O usuario vai escolher se acompanha por horas que ele informar, ou por modulos ou por aulas
- Calcular o campo horas totais de acordo com as aulas concluidas
-no campo cursos para esta semana, criar icones para organizar e categorizar ( maior para menor, por categoria, por insituição),
marcar todos ou desmarcat dodos.
-Caso haja solicitações no campo assistente, habilitar para a solicitação feita por esse campo surta efeito nos demais de acordo com a solicitação do usuario
-No campo certificados, quando for um curso que é referente a um Bootcamp, habilitar e guardar no mesmo painel de certificados do curso, todos os certificados que o usuario 
conquiste neste bootcamp
-No campo favoritos, quando o usuario clicar no curso favorito, deve levar o usuario para a plataforma do curso a qual ele clicou
-Ao fazer logim, deixar salvo a ultima configuração do app a qual o usuario tinha alterado EX. modo escuro ao sair e retornar o app retorna no modo escuro,
Exibir: por grades, ao sair e retornar o app retorna com o modo grade
-Mensagem de boas-vindas personalizada no topo.
-Card de próximo passo recomendado, para guiar direto à aula seguinte.
-Mini agenda do dia, com tarefas rápidas e link para ver a agenda completa.
-Resumo de progresso em cards claros (sequência, horas, progresso geral).
-Conquistas desbloqueadas e badges motivacionais.
-Gráfico de evolução semanal, para dar a sensação de avanço contínuo.
-Dica motivacional no rodapé, leve e inspiradora.
