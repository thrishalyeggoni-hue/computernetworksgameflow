"""Build the website's complete, downloadable CN notes from its source course data."""
from pathlib import Path
import subprocess,json,re,shutil,hashlib
from html import escape
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parent.parent
raw=subprocess.run(['node','--experimental-strip-types','--input-type=module','-e',"import {networkUnits,networkSyllabus} from './src/learning/network-course.ts'; process.stdout.write(JSON.stringify({units:networkUnits,syllabus:networkSyllabus}));"],cwd=ROOT,capture_output=True,text=True,check=True)
data=json.loads(raw.stdout);units=data['units'];meta=data['syllabus']
for name,file in [('Body','Arial Unicode.ttf'),('Bold','Arial Bold.ttf'),('Display','Arial Rounded Bold.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/System/Library/Fonts/Supplemental/'+file))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
INK=colors.HexColor('#29473f');MUTED=colors.HexColor('#77856f');LINE=colors.HexColor('#d9e2d2');W,H=A4;CW=W-92
PALETTE=[('#43877a','#e1f1e8'),('#4889bc','#e2eefb'),('#9b6abe','#eee3fa'),('#cb8b3b','#fff0d2'),('#b05e91','#f7e2ee')]
def norm(s):return str(s).replace('\u2011','-').replace('\u2013','-').replace('\u2014',' - ')
def esc(s):return escape(norm(s))
style={
 'body':ParagraphStyle('body',fontName='Body',fontSize=10,leading=14.5,textColor=INK,spaceAfter=9),
 'small':ParagraphStyle('small',fontName='Body',fontSize=8.6,leading=12.3,textColor=MUTED,spaceAfter=7),
 'h1':ParagraphStyle('h1',fontName='Display',fontSize=26,leading=32,textColor=INK,spaceAfter=14),
 'h2':ParagraphStyle('h2',fontName='Bold',fontSize=14,leading=19,textColor=INK,spaceAfter=9,spaceBefore=11),
 'topic':ParagraphStyle('topic',fontName='Bold',fontSize=13,leading=18,textColor=INK,spaceAfter=9),
 'cell':ParagraphStyle('cell',fontName='Body',fontSize=9.1,leading=13.3,textColor=INK),
 'label':ParagraphStyle('label',fontName='Bold',fontSize=8.6,leading=12,textColor=INK),
 'tag':ParagraphStyle('tag',fontName='Bold',fontSize=8,leading=12,textColor=MUTED,spaceAfter=9),
 'cover':ParagraphStyle('cover',fontName='Display',fontSize=36,leading=43,textColor=INK,spaceAfter=17),
}
def p(s,t='body'):return Paragraph(s,style[t])
def txt(s,t='body'):return p(esc(s),t)
story=[]
def add(s,t='body'):story.append(p(s,t))
def heading(text,key,t='h1',toc=False):
 q=txt(text,t);q.key=key;q.title=norm(text);q.toc=toc;story.append(q)
def box(rows,tone,pale):
 table=Table([[txt(a,'label'),txt(b,'cell')] for a,b in rows],colWidths=[104,CW-104])
 rules=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),11),('RIGHTPADDING',(0,0),(-1,-1),11),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),('BOX',(0,0),(-1,-1),.5,LINE),('BACKGROUND',(0,0),(0,-1),colors.HexColor(pale))]
 for i in range(len(rows)):
  rules.append(('LINEBELOW',(0,i),(-1,i),.4,LINE))
  if rows[i][0]=='Common mix-up':rules.append(('BACKGROUND',(1,i),(1,i),colors.HexColor('#fff5e5')))
 table.setStyle(TableStyle(rules));return table
class NotesDoc(SimpleDocTemplate):
 chapter=0
 def afterFlowable(self,f):
  if hasattr(f,'key'):
   self.canv.bookmarkPage(f.key);self.canv.addOutlineEntry(f.title,f.key,level=0 if getattr(f,'toc',False) else 1,closed=False)
   if getattr(f,'toc',False):self.notify('TOCEntry',(0,f.title,self.page,f.key))
def decorate(c,doc):
 c.saveState();c.setFillColor(colors.HexColor('#fcfcf7'));c.rect(0,0,W,H,stroke=0,fill=1)
 c.setFont('Display',11);c.setFillColor(colors.HexColor('#43877a'));c.drawString(46,H-32,'PacketVerse / CN study notes')
 c.setFont('Body',7);c.setFillColor(MUTED);c.drawRightString(W-46,H-32,'R25 / CYS / THEORY / UNITS 1-5')
 c.setStrokeColor(LINE);c.line(46,H-43,W-46,H-43);c.line(46,40,W-46,40)
 c.setFont('Body',7.3);c.drawString(46,27,'Independent teaching notes | Colour-coded chapters | Plain-language explanations');c.drawRightString(W-46,27,str(doc.page));c.restoreState()

add('VNRVJIET / R25 / CSE (CYBER SECURITY)','tag')
add('Computer Networks.<br/>The complete study notes.','cover')
add('All five theory units, explained in everyday language.','h2')
add(f'{esc(meta["code"])} | II year / III semester | 3 credits','small')
add('A structured companion to the visual classroom: clear explanations, networking terminology, links to the app, common mistakes, worked examples and revision prompts.')
rows=[[str(u['id']),u['title']] for u in units]
t=Table([[txt('UNIT','label'),txt('YOUR LEARNING PATH','label')]]+[[txt(a,'label'),txt(b)] for a,b in rows],colWidths=[52,CW-52])
rules=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),12)]
for i,(tone,pale) in enumerate(PALETTE,1):rules += [('BACKGROUND',(0,i),(-1,i),colors.HexColor(pale)),('LINEBEFORE',(0,i),(0,i),3,colors.HexColor(tone))]
t.setStyle(TableStyle(rules));story.append(t);story.append(Spacer(1,18))
add('How to use these notes','h2')
add('Read the everyday explanation first. Then connect it to the networking terms. Use the app connection to see what you can explore, and the common mix-up to check your understanding. End each unit with its worked example and revision questions.')
add(f'Independent teaching notes, not official college notes. The separate laboratory syllabus is excluded. Course mapping: <link href="{meta["source"]}" color="#4889bc"><u>official theory syllabus, printed pages 8-9</u></link>.','small')
story.append(PageBreak())
add('CONTENTS / CLICK A UNIT TO JUMP','tag');add('Your five-unit study path.','h1')
toc=TableOfContents();toc.levelStyles=[ParagraphStyle('toc',fontName='Body',fontSize=12,leading=19,spaceBefore=16,textColor=INK,leftIndent=0,firstLineIndent=0)];story.append(toc)
story.append(Spacer(1,24));add('What the coverage badges mean','h2')
story.append(box([('Live model','The app models this behaviour. It is still a teaching model rather than a complete implementation of every protocol rule.'),('Partial model','The app demonstrates only a subset of the concept. Read the connection note to see its limits.'),('Theory only','The concept is explained in the classroom. The packet simulator does not implement it.')],*PALETTE[0]))
story.append(Spacer(1,18));add('Five-part topic cards','h2');add('Every topic keeps the same pattern: its name and coverage badge, an everyday explanation, technical terms, the PacketVerse connection, and a common mistake to avoid.')
add('The same 47 topics available in the website are included here. Topic bookmarks in your PDF reader make it easy to jump to a particular concept.','small')

for u in units:
 tone,pale=PALETTE[u['id']-1]
 story.append(PageBreak());add(f'UNIT {u["id"]:02d} / {len(u["topics"])} TOPICS','tag')
 heading(f'Unit {u["id"]}: {u["title"]}',f'unit-{u["id"]}',toc=True)
 add(esc(u['question']),'h2');add(esc(u['idea']))
 add('What you will cover','h2')
 overview=Table([[txt('TOPIC','label'),txt('COVERAGE','label')]]+[[txt(t['title'],'cell'),txt(t['coverage'],'cell')] for t in u['topics']],colWidths=[CW*.72,CW*.28])
 overview.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor(pale)),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,-1),.4,LINE)]));story.append(overview)
 story.append(PageBreak())
 for i,t in enumerate(u['topics'],1):
  title=txt(f'{u["id"]}.{i:02d}  {t["title"]}','topic');title.key=f'topic-{u["id"]}-{i}';title.title=f'{u["id"]}.{i:02d} {norm(t["title"])}'
  badge=Paragraph(f'<font color="{tone}">{esc(t["coverage"].upper())}</font>',style['tag'])
  card=box([('In everyday words',t['plain']),('Networking terms',t['detail']),('In PacketVerse',t['connection']),('Common mix-up',t['watch'])],tone,pale)
  story.append(KeepTogether([title,badge,card,Spacer(1,22)]))
 story.append(PageBreak());add(f'UNIT {u["id"]:02d} / PRACTISE AND REVISE','tag')
 heading(f'Unit {u["id"]}: worked example & revision',f'review-{u["id"]}','h1')
 add(esc(u['worked']['title']),'h2')
 for i,s in enumerate(u['worked']['steps'],1):add(f'<b>{i}.</b> {esc(s)}')
 add('Explain these aloud','h2')
 for i,s in enumerate(u['revision'],1):add(f'<b>{i}.</b> {esc(s)}')
 add('Check your understanding','h2');add(esc(u['check']['question']))
 story.append(box([('Answer',u['check']['answer']),('Explore in the app',u['scene']['instruction'])],tone,pale))

story.append(PageBreak());heading('Protocol references & scope','references',toc=True)
add('Use these primary references when you want to move beyond the short teaching explanations.')
for label,url in [('TCP: RFC 9293','https://www.rfc-editor.org/rfc/rfc9293.html'),('UDP: RFC 768','https://www.rfc-editor.org/rfc/rfc768.html'),('ARP: RFC 826','https://www.rfc-editor.org/rfc/rfc826.html'),('DNS concepts: RFC 1034','https://www.rfc-editor.org/rfc/rfc1034.html')]:add(f'<link href="{url}" color="#4889bc"><u>{label}</u></link>')
add('What this document contains','h2');add('The complete five-unit notes currently authored in PacketVerse: all 47 topics, their coverage labels and four explanations, all worked examples, revision prompts, self-check questions and answers, and links between theory and the app.')
add('The classroom uses concept pictures and the lab uses a deterministic teaching simulation. These notes make the boundaries explicit. A topic marked Theory only is not presented as an implemented simulator protocol.','small')
add('Source course','h2');add(f'{esc(meta["institution"])} / {esc(meta["regulation"])} / {esc(meta["branch"])} / {esc(meta["semester"])} / {esc(meta["code"])}. Theory course only.');add(f'<link href="{meta["source"]}" color="#4889bc"><u>Official syllabus used for course mapping</u></link>')
output=ROOT/'output/pdf/PacketVerse-CN-R25-Units-1-to-5.pdf';output.parent.mkdir(parents=True,exist_ok=True)
doc=NotesDoc(str(output),pagesize=A4,leftMargin=46,rightMargin=46,topMargin=64,bottomMargin=55,title='PacketVerse - Complete CN Notes - R25 CYS Units 1-5',author='PacketVerse',pageCompression=1)
doc.multiBuild(story,onFirstPage=decorate,onLaterPages=decorate)
served=ROOT/'public/downloads'/output.name;served.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(output,served)
manifest={'units':len(units),'topics':sum(len(u['topics']) for u in units),'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'filename':output.name}
(ROOT/'docs/study-notes-pdf-manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
