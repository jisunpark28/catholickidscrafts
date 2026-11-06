"""Writes src/data/evergreen-sheets/*.json + index.ts. Run: python scripts/evergreen-sheets/build.py"""
import json, os, re
from virtues import V
os.chdir(os.path.dirname(os.path.abspath(__file__))); OUT="../.."; os.makedirs(f"{OUT}/src/data/evergreen-sheets",exist_ok=True)
DAYS=["MON","TUE","WED","THU","FRI","SAT"]
sheets=[]; pages=[]; cards=[]
def slugify(s): return re.sub(r"-+","-",re.sub(r"[^a-z0-9]+","-",s.lower())).strip("-")
INTRO="Color a star each day, Monday through Saturday. Hang this sheet on the fridge and practice with your family. A parent signs at the end of the week."
for i,(name,fam,color,ref,dr,short,m1,m2,kl,a,b,q,prayer,ctext,words) in enumerate(V):
    disp=name.replace(" (Virtue Challenge)","")
    key="VIR_"+slugify(disp).upper().replace("-","_"); slug=slugify(disp)
    def lvl(n,story,ms,qs):
        return {"title":f"This Week's Catholic Virtue: {disp}","story":story,"keyLine":kl,
          "heartTitle":"Family Talk","heartIntro":f"Hang this sheet on the fridge and practice {disp.lower()} all week. On Saturday, talk together, write what you practiced, and a parent signs.",
          "heartLabelA":"We practiced","heartLabelB":"Next week",
          "questions":qs,"actions":["Hang this sheet on the fridge",f"Practice {disp.lower()} every day","A parent signs on Saturday"][:3],
          "prayer":prayer,
          "activity":{"title":"Daily Action Checklist","intro":INTRO,"type":"checklist","items":[f"{d}: {x}" for d,x in zip(DAYS,ms)]},
          "words":words}
    q2=[q[0], q[1]] ; q2b=["Which day's mission was hardest, and why?",f"How did God help us grow in {disp.lower()}?"]
    s={"key":key,"liturgicalName":f"{disp} Virtue Challenge","season":"Family Virtue Challenge","gospelRef":ref,
       "keyVerseDR":f"\"{dr}\" ({short})","color":color,
       "levels":{"level1":lvl(1,m1,a,q2),"level2":lvl(2,m2,b,q2b if False else [q[0], q2b[1]])},
       "art":{"main":f"{key}_main.png","heart":f"{key}_heart.png","icons":["icon_star.png","icon_fridge.png","icon_family.png"],
              "mainBrief":f"A Catholic family practicing {disp.lower()} together at home","heartBrief":"Stars and a family around a heart"}}
    cid=f"VIR-{54+i:03d}"
    sheets.append(s); pages.append(dict(key=key,slug=slug,kind="virtue",name=disp,virtueFamily=fam,relatedCardIds=[cid]))
    cards.append({"id":cid,"cat":"Virtue & Life","set":"Family Virtue Challenge","title":name,"text":ctext,"prio":1,"ref":short,"sheetKeys":[key]})
# Mass
M=[
("MASS_INTRO","introductory-rites","Introductory Rites","Introductory Rites","For where there are two or three gathered together in my name, there am I in the midst of them.","Mt 18:20","Matthew 18:20",
 "When Mass begins, we gather as God's family. We sing as the priest comes in. We make the Sign of the Cross and say sorry to God. We sing \"Lord, have mercy\" and \"Glory to God,\" and the priest prays the opening prayer.",
 "The Introductory Rites open the Mass and gather us into one family before God. During the Entrance, we stand and sing as the priest and servers process to the altar. In the Greeting, we make the Sign of the Cross: \"In the name of the Father, and of the Son, and of the Holy Spirit.\" The priest says, \"The Lord be with you,\" and we answer, \"And with your spirit.\" In the Penitential Act we tell God we are sorry, and we pray the Kyrie: \"Lord, have mercy. Christ, have mercy.\" On Sundays (outside Advent and Lent) we sing the Gloria, the angels' song from Christmas night. Then the priest says, \"Let us pray,\" and gathers all our prayers in the Collect.",
 "We gather in Jesus' name.",
 ["Entrance","Greeting","Penitential Act","Kyrie (Lord, have mercy)","Gloria","Collect (Opening Prayer)"],
 ["Entrance: we stand and sing","Greeting: The Lord be with you","Penitential Act: I confess","Kyrie: Lord, have mercy","Gloria: Glory to God in the highest","Collect: the priest gathers our prayers"],
 ["What do we say when we make the Sign of the Cross?","Why do we tell God we are sorry at the start of Mass?"],
 "Lord Jesus, thank You for gathering us as Your family. Help me pray with my whole heart. Amen.",
 "Mass begins as we gather in Jesus' name: Entrance, Greeting, Penitential Act, Kyrie, Gloria, and Collect.",
 ["gather","sorry","Gloria","pray"],"white","the priest walking to the altar as families stand and sing"),
("MASS_WORD","liturgy-of-the-word","Liturgy of the Word","Liturgy of the Word","Blessed are they who hear the word of God, and keep it.","Lk 11:28","Luke 11:28",
 "Now God speaks to us! We sit and listen to the readings from the Bible. We stand for the Gospel about Jesus. The priest explains it, we say what we believe in the Creed, and we pray for everyone.",
 "In the Liturgy of the Word, God speaks to His people through Holy Scripture. We sit and listen to the First Reading, usually from the Old Testament. We answer with the Responsorial Psalm. On Sundays there is also a Second Reading, often from a letter of Saint Paul. Then we stand and sing the Gospel Acclamation, \"Alleluia!\" (or another verse in Lent), because Jesus Himself is about to speak in the Gospel. We trace small crosses on our forehead, lips, and heart. The priest or deacon explains the readings in the Homily. Then we stand and profess our faith in the Creed, and we pray for the Church and the world in the Prayer of the Faithful.",
 "God speaks, and I listen.",
 ["First Reading","Responsorial Psalm","Gospel Acclamation","Gospel","Homily","Profession of Faith (Creed)","Prayer of the Faithful"],
 ["First Reading","Responsorial Psalm","Second Reading","Gospel Acclamation (Alleluia)","Gospel","Homily","Profession of Faith (Creed)","Prayer of the Faithful"],
 ["What part of the Bible do we hear when we stand?","What do we ask God for in the Prayer of the Faithful?"],
 "Jesus, open my ears to hear Your Word and my heart to keep it. Amen.",
 "God speaks to us in the readings, the Gospel, and the homily. We answer with the Creed and our prayers.",
 ["Bible","Gospel","listen","Creed"],"green","a reader at the ambo and children listening"),
("MASS_EUCHARIST","liturgy-of-the-eucharist","Liturgy of the Eucharist","Liturgy of the Eucharist","This is my body, which is given for you. Do this for a commemoration of me.","Lk 22:19","Luke 22:19",
 "We bring bread and wine to the altar. The priest prays, and the bread and wine become Jesus' Body and Blood. We pray the Our Father, share a sign of peace, and receive Jesus in Holy Communion.",
 "In the Liturgy of the Eucharist, we do what Jesus asked at the Last Supper. In the Presentation of the Gifts, bread and wine are brought to the altar, along with our gifts for the Church and the poor. In the Eucharistic Prayer, the priest prays the words of Jesus, and by the power of the Holy Spirit the bread and wine become the Body and Blood of Christ. We sing \"Holy, Holy, Holy\" and the Great Amen. Then we pray the Lord's Prayer together as God's children. We share the Sign of Peace with those around us. After the Lamb of God, we receive Jesus in Holy Communion (or make a spiritual communion and receive a blessing if we have not made our First Communion yet).",
 "Jesus gives Himself to us.",
 ["Presentation of the Gifts","Eucharistic Prayer","The Lord's Prayer","Sign of Peace","Holy Communion"],
 ["Presentation of the Gifts","Eucharistic Prayer: Holy, Holy, Holy","Lord's Prayer: Our Father","Sign of Peace: Peace be with you","Lamb of God","Holy Communion: Body of Christ. Amen"],
 ["What do the bread and wine become?","How can we get our hearts ready to receive Jesus?"],
 "Jesus, thank You for giving Yourself to us in the Eucharist. Make my heart ready for You. Amen.",
 "Bread and wine become the Body and Blood of Jesus, and we receive Him in Holy Communion.",
 ["bread","wine","altar","Communion"],"gold","the priest raising the Host at the altar"),
("MASS_PARTS","four-parts-of-the-mass","Four Parts of the Mass","Four Parts of the Mass","Go ye into the whole world, and preach the gospel to every creature.","Mk 16:15","Mark 16:15",
 "The Mass has four parts. We gather in God's name. We listen to God's Word. We receive Jesus. Then we are sent out to love our neighbor and share the Good News!",
 "The Mass has four main parts. In the Introductory Rites, we gather and begin \"In the name of the Father, and of the Son, and of the Holy Spirit.\" In the Liturgy of the Word, we listen to God's Word from the Bible. In the Liturgy of the Eucharist, bread and wine become Jesus' Body and Blood, and we receive Jesus in Holy Communion. In the Concluding Rites, the priest blesses us and sends us out: \"Go in peace.\" We answer, \"Thanks be to God!\" Mass does not really end at the church door. Jesus sends us to love our neighbor and share the Gospel all week long.",
 "We gather, listen, receive, and go!",
 None,
 ["Introductory Rites: we gather","Liturgy of the Word: we listen","Liturgy of the Eucharist: we receive","Concluding Rites: we are sent"],
 ["What are the four parts of the Mass?","How can we share Jesus after Mass this week?"],
 "Jesus, thank You for the gift of the Mass. Send me out to love and serve You. Amen.",
 "The four parts of the Mass: we gather, we listen to God's Word, we receive Jesus, and we go out to love.",
 ["gather","listen","receive","go"],"white","families leaving church with joy after the blessing"),
]
for j,(key,slug,name,lit,dr,short,ref,s1,s2,kl,p1,p2,q,prayer,ctext,words,color,brief) in enumerate(M):
    def lvl(n,story,act):
        return {"title":name,"story":story,"keyLine":kl,"heartTitle":"My Mass Heart",
          "heartIntro":"Draw or write how you will take part in this part of the Mass next Sunday.",
          "heartLabelA":"At Mass I will","heartLabelB":"This week I will","questions":q,
          "actions":["Bring this sheet to Mass","Say the responses out loud","Talk about Mass at lunch"],
          "prayer":prayer,"activity":act,"words":words}
    if p1 is None:
        a1={"title":"Match the parts of the Mass","intro":"Draw a line from each part of the Mass to what we do.","type":"matchup",
            "pairs":[["Introductory Rites","In the name of the Father..."],["Liturgy of the Word","We listen to God's Word"],["Liturgy of the Eucharist","We receive Jesus"],["Concluding Rites","Go, love your neighbor and share the Gospel"]]}
    else:
        a1={"title":f"Put the {name} in order","intro":f"Write 1 to {len(p1)} in the boxes to show the order at Mass.","type":"wordorder","pieces":p1}
    a2={"title":f"Put the {name} in order","intro":f"Number the steps 1 to {len(p2)}. Then write which step you like best.","type":"wordorder","pieces":p2}
    s={"key":key,"liturgicalName":lit,"season":"The Order of Mass","gospelRef":ref,"keyVerseDR":f"\"{dr}\" ({short})","color":color,
       "levels":{"level1":lvl(1,s1,a1),"level2":lvl(2,s2,a2)},
       "art":{"main":f"{key}_main.png","heart":f"{key}_heart.png","icons":["icon_altar.png","icon_cross.png","icon_bible.png"],"mainBrief":brief,"heartBrief":"Mass symbols around a heart"}}
    cid=f"MAS-{66+j:03d}"
    sheets.insert(j,s); pages.insert(j,dict(key=key,slug=slug,kind="mass",name=name,relatedCardIds=[cid,"MAS-001"]))
    cards.insert(j,{"id":cid,"cat":"Mass & Church","set":"Order of the Mass","title":name,"text":ctext,"prio":1,"ref":"The Order of Mass","sheetKeys":[key]})
for s in sheets:
    json.dump(s,open(f"{OUT}/src/data/evergreen-sheets/{s['key']}.json","w",newline="\n"),indent=2,ensure_ascii=False)
    open(f"{OUT}/src/data/evergreen-sheets/{s['key']}.json","a").write("\n")
idx=["// Evergreen (non-Sunday) worksheets: Order of Mass + Family Virtue Challenge.","// Generated by scripts/evergreen-sheets/build.py; validated by scripts/test-evergreen-sheets.ts.","import type { SundaySheetContent } from \"@/lib/sunday-sheet-content\";"]
for s in sheets: idx.append(f"import {s['key']} from \"./{s['key']}.json\";")
idx.append("\nexport const EVERGREEN_SHEETS: Record<string, SundaySheetContent> = {")
for s in sheets: idx.append(f"  {s['key']}: {s['key']} as SundaySheetContent,")
idx.append("};\n")
open(f"{OUT}/src/data/evergreen-sheets/index.ts","w").write("\n".join(idx))
json.dump(pages,open("pages.json","w"),indent=2)  # scratch rows for src/lib/seo/evergreen-worksheets.ts
open("cards.jsonl","w").write("".join(json.dumps(c,ensure_ascii=False,separators=(",",":"))+",\n" for c in cards))
# checks
for s in sheets:
    for l in s["levels"].values():
        for it in l["activity"].get("items",[])+l["activity"].get("pieces",[]): assert len(it)<= (60 if "items" in l["activity"] else 40),(s["key"],it)
        assert len(l["story"])<=1200 and len(l["prayer"])<=200 and len(l["heartIntro"])<=300,s["key"]
print(len(sheets),len(cards))
