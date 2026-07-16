// Portuguese texts aligned with CNBB Missal Romano (edição típica brasileira)
// https://www.cnbb.org.br
import type { PrayerTranslationMap } from "@/lib/prayers/prayer-types";

export const PT_PRAYERS: PrayerTranslationMap = {
  "sign-of-the-cross": {
    title: "Sinal da Cruz",
    text: "Em nome do Pai, e do Filho, e do Espírito Santo. Amém.",
  },
  "our-father": {
    title: "Pai Nosso",
    subtitle: "A oração do Senhor",
    text: "Pai Nosso, que estais nos Céus, santificado seja o vosso nome, venha a nós o vosso reino, seja feita a vossa vontade assim na terra como no céu. O pão nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.",
  },
  "hail-mary": {
    title: "Ave Maria",
    text: "Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.",
  },
  "glory-be": {
    title: "Glória",
    text: "Glória ao Pai, e ao Filho, e ao Espírito Santo. Como era no princípio, agora e sempre, pelos séculos dos séculos. Amém.",
  },
  "fatima-prayer": {
    title: "Oração de Fátima",
    subtitle: "Ao final de cada dezena do Terço",
    text: "Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o Céu e socorrei principalmente as que mais precisarem da Vossa misericórdia. Amém.",
  },
  "apostles-creed": {
    title: "Credo dos Apóstolos",
    text: `Creio em Deus Pai todo-poderoso, Criador do céu e da terra. E em Jesus Cristo, seu único Filho, nosso Senhor, que foi concebido pelo Espírito Santo, nasceu da Virgem Maria, padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado, desceu à mansão dos mortos, ressuscitou ao terceiro dia, subiu aos céus, está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos.

Creio no Espírito Santo, na santa Igreja Católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne e na vida eterna. Amém.`,
  },
  "nicene-creed": {
    title: "Credo Niceno-Constantinopolitano",
    subtitle: "Missa dominical e em solenidades",
    text: `Creio em um só Deus, Pai todo-poderoso, Criador do céu e da terra, de todas as coisas visíveis e invisíveis.

Creio em um só Senhor, Jesus Cristo, Filho Unigênito de Deus, nascido do Pai antes de todos os séculos: Deus de Deus, Luz da Luz, Deus verdadeiro de Deus verdadeiro, gerado, não criado, consubstancial ao Pai. Por ele todas as coisas foram feitas. E por nós, homens, e para nossa salvação, desceu dos céus e se encarnou pelo Espírito Santo, no seio da Virgem Maria, e se fez homem. Também por nós foi crucificado sob Pôncio Pilatos; padeceu e foi sepultado. Ressuscitou ao terceiro dia, conforme as Escrituras, e subiu aos céus, onde está sentado à direita do Pai. De novo há de vir, em sua glória, para julgar os vivos e os mortos, e o seu Reino não terá fim.

Creio no Espírito Santo, Senhor que dá a vida, e procede do Pai e do Filho; com o Pai e o Filho é adorado e glorificado: ele que falou pelos profetas.

Creio na Igreja, una, santa, católica e apostólica. Professo um só batismo para remissão dos pecados. E espero a ressurreição dos mortos e a vida do mundo que há de vir. Amém.`,
  },
  "morning-offering": {
    title: "Oração da Manhã",
    text: "Ó Jesus, pelo Imaculado Coração de Maria, Vos ofereço as minhas orações, obras, alegrias e sofrimentos deste dia, em união com o Sacrifício santo da Missa em todo o mundo, por todas as intenções do Vosso Sacratíssimo Coração: a salvação das almas, a reparação dos pecados, a união de todos os cristãos e as intenções do nosso Santo Padre. Amém.",
  },
  angelus: {
    title: "Angelus",
    subtitle: "Tradicionalmente às 6h, ao meio-dia e às 18h",
    text: `V. O Anjo do Senhor anunciou a Maria.
R. E concebeu do Espírito Santo.

Ave Maria…

V. Eis a serva do Senhor.
R. Faça-se em mim segundo a vossa palavra.

Ave Maria…

V. E o Verbo se fez carne.
R. E habitou entre nós.

Ave Maria…

V. Rogai por nós, santa Mãe de Deus.
R. Para que sejamos dignos das promessas de Cristo.

Oremos: Infundi, Senhor, a vossa graça em nossos corações, para que, conhecendo pela mensagem do Anjo a encarnação do vosso Filho Jesus Cristo, sejamos conduzidos pela sua Paixão e Cruz à glória da Ressurreição. Pelo mesmo Cristo, nosso Senhor. Amém.`,
  },
  "regina-caeli": {
    title: "Regina Caeli",
    subtitle: "Tempo pascal, em lugar do Angelus",
    text: `V. Rainha do Céu, alegra-te, aleluia.
R. Porque aquele que mereceste trazer no teu seio, aleluia.

V. Ressuscitou, como disse, aleluia.
R. Rogai por nós a Deus, aleluia.

V. Alegra-te e exulta, Virgem Maria, aleluia.
R. Porque verdadeiramente ressuscitou o Senhor, aleluia.

Oremos: Ó Deus, que pela ressurreição do vosso Filho, nosso Senhor Jesus Cristo, destes ao mundo a alegria, concedei-nos, pela intercessão da Virgem Maria, sua Mãe, alcançarmos as alegrias da vida eterna. Pelo mesmo Cristo, nosso Senhor. Amém.`,
  },
  "grace-before-meals": {
    title: "Bênção Antes das Refeições",
    text: "Abençoai, Senhor, a nós e a estes dons que da vossa bondade vamos receber. Por Cristo, nosso Senhor. Amém.",
  },
  "grace-after-meals": {
    title: "Ação de Graças Depois das Refeições",
    text: `Damos-Vos graças, Deus todo-poderoso, por todos os vossos benefícios, que viveis e reinais pelos séculos dos séculos. Amém.

Que as almas dos fiéis defuntos, pela misericórdia de Deus, descansem em paz. Amém.`,
  },
  "guardian-angel": {
    title: "Oração ao Anjo da Guarda",
    text: "Anjo de Deus, que sois o meu guardião, a quem a bondade divina me confiou, iluminai-me, guardai-me, regi-me e governai-me. Amém.",
  },
  "come-holy-spirit": {
    title: "Vinde, Espírito Santo",
    text: `Vinde, Espírito Santo, enchei os corações dos vossos fiéis e acendei neles o fogo do vosso amor.

Enviai o vosso Espírito e tudo será criado, e renovareis a face da terra.

Oremos: Ó Deus, que instruístes os corações dos fiéis com a luz do Espírito Santo, concedei-nos, no mesmo Espírito, ser verdadeiramente sábios e gozar sempre do seu consolo. Por Cristo, nosso Senhor. Amém.`,
  },
  "act-of-contrition": {
    title: "Ato de Contrição",
    text: "Meu Deus, eu me arrependo, de todo o coração, de todos os meus pecados, e proponho-me, com a vossa ajuda, não mais pecar e fugir das ocasiões próximas de pecado. Amém.",
  },
  "anima-christi": {
    title: "Anima Christi",
    subtitle: "Alma de Cristo",
    text: `Alma de Cristo, santificai-me.
Corpo de Cristo, salvai-me.
Sangue de Cristo, inebriai-me.
Água do lado de Cristo, lavai-me.
Paixão de Cristo, fortificai-me.
Ó bom Jesus, ouvi-me.
Dentro das vossas chagas, escondei-me.
Não permitais que eu me separe de vós.
Do inimigo maligno, defendei-me.
Na hora da minha morte, chamai-me
e mandai-me ir para vós,
para que com os vossos santos vos louve
por todos os séculos dos séculos. Amém.`,
  },
  "prayer-before-communion": {
    title: "Oração Antes da Comunhão",
    text: "Senhor, não sou digno de que entreis debaixo do meu telhado, mas dizei apenas uma palavra e a minha alma ficará salva.",
  },
  "prayer-after-communion": {
    title: "Oração Depois da Comunhão",
    text: "Senhor Jesus Cristo, dou-Vos graças por terdes vindo a mim neste Santo Sacramento. Permanecei comigo e ajudai-me a amar-Vos cada vez mais. Amém.",
  },
  memorare: {
    title: "Memorare",
    text: "Lembrai-vos, ó piíssima Virgem Maria, que nunca se ouviu dizer que algum daqueles que têm recorrido à vossa proteção, implorado a vossa assistência ou reclamado o vosso socorro, fosse por vós desamparado. Animado com esta confiança, a vós recorro, ó Mãe, Virgem das virgens; a vós venho, diante de vós me apresento pecador e arrependido. Ó Mãe do Verbo Encarnado, não desprezeis as minhas súplicas, mas na vossa misericórdia ouvi-as e acolhei-as. Amém.",
  },
  "hail-holy-queen": {
    title: "Salve Rainha",
    subtitle: "Salve Regina",
    text: `Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva; a vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei; e depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria.

Rogai por nós, santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.`,
  },
  "prayer-to-st-michael": {
    title: "Oração a São Miguel Arcanjo",
    text: "São Miguel Arcanjo, defendei-nos no combate. Sede o nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pelo poder divino, precipitai no inferno a Satanás e aos outros espíritos malignos que andam pelo mundo para perder as almas. Amém.",
  },
  "prayer-of-st-francis": {
    title: "Oração de São Francisco",
    text: `Senhor, fazei de mim um instrumento da vossa paz:
onde houver ódio, que eu leve o amor;
onde houver ofensa, que eu leve o perdão;
onde houver discórdia, que eu leve a união;
onde houver dúvida, que eu leve a fé;
onde houver erro, que eu leve a verdade;
onde houver desespero, que eu leve a esperança;
onde houver tristeza, que eu leve a alegria;
onde houver trevas, que eu leve a luz.

Ó Mestre, fazei que eu procure mais consolar do que ser consolado, compreender do que ser compreendido, amar do que ser amado. Porque é dando que se recebe, é perdoando que se é perdoado e é morrendo que se vive para a vida eterna. Amém.`,
  },
  "eternal-rest": {
    title: "Descanso Eterno",
    subtitle: "Oração pelos fiéis defuntos",
    text: `Dai-lhes, Senhor, o descanso eterno, e brilhe para eles a luz perpétua. Descansem em paz. Amém.

Que as almas dos fiéis defuntos, pela misericórdia de Deus, descansem em paz. Amém.`,
  },
  "sub-tuum": {
    title: "Sub Tuum Praesidium",
    subtitle: "Recorremos à vossa proteção",
    text: "Recorremos, ó santa Mãe de Deus, à vossa proteção; não desprezeis as nossas súplicas em nossas necessidades, mas livrai-nos sempre de todos os perigos, ó Virgem gloriosa e bendita. Amém.",
  },
};
