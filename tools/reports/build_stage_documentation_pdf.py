"""Exporta las dos fuentes Markdown de etapa, sin consultas ni datos privados."""
from pathlib import Path
from xml.sax.saxutils import escape
import json, re
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/pdf'
OUT.mkdir(parents=True,exist_ok=True)
for name,file in [('Stage','arial.ttf'),('StageBold','arialbd.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Stage',normal='Stage',bold='StageBold',italic='Stage',boldItalic='StageBold')
INK=colors.HexColor('#1C1135'); VIOLET=colors.HexColor('#6D28D9'); TEAL=colors.HexColor('#0D9488')
WIDTH=A4[0]-100
styles={
'title':ParagraphStyle('title',fontName='StageBold',fontSize=24,leading=29,textColor=INK,spaceAfter=22),
'h2':ParagraphStyle('h2',fontName='StageBold',fontSize=17,leading=22,textColor=VIOLET,spaceBefore=10,spaceAfter=15,keepWithNext=True),
'h3':ParagraphStyle('h3',fontName='StageBold',fontSize=12,leading=16,textColor=TEAL,spaceBefore=14,spaceAfter=8,keepWithNext=True),
'h4':ParagraphStyle('h4',fontName='StageBold',fontSize=11,leading=15,textColor=INK,spaceBefore=12,spaceAfter=7,keepWithNext=True),
'body':ParagraphStyle('body',fontName='Stage',fontSize=9.5,leading=14,textColor=INK,spaceAfter=9,splitLongWords=True),
'cell':ParagraphStyle('cell',fontName='Stage',fontSize=8,leading=11,textColor=INK,splitLongWords=True),
'th':ParagraphStyle('th',fontName='StageBold',fontSize=8,leading=11,textColor=colors.white,splitLongWords=True),
'code':ParagraphStyle('code',fontName='Stage',fontSize=8,leading=11,textColor=INK,backColor=colors.HexColor('#F5F3FF'),borderPadding=8,spaceAfter=10,splitLongWords=True),
}
def inline(s):
    s=s.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:m.group(1)+' ('+m.group(2)+')',s)
    s=escape(s.replace('`',''))
    return re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',s)

class Diagram(Flowable):
    def __init__(self,kind):
        Flowable.__init__(self); self.width=WIDTH; self.height=310 if kind=='architecture' else 300; self.kind=kind
    def draw(self):
        c=self.canv
        def box(x,y,w,label,sub=''):
            c.setFillColor(colors.HexColor('#F5F3FF')); c.setStrokeColor(colors.HexColor('#C4BAE0')); c.roundRect(x,y,w,38,7,fill=1,stroke=1)
            c.setFillColor(INK); c.setFont('StageBold',9); c.drawCentredString(x+w/2,y+23,label)
            c.setFont('Stage',7); c.drawCentredString(x+w/2,y+10,sub)
        def arrow(x1,y1,x2,y2):
            c.setStrokeColor(TEAL); c.setLineWidth(1); c.line(x1,y1,x2,y2)
            c.line(x2,y2,x2-3,y2+5);c.line(x2,y2,x2+3,y2+5)
        if self.kind=='architecture':
            nodes=[('Usuario','ADMIN / PADRE / TERAPEUTA'),('Frontend','React en navegador'),('Backend','FastAPI - servicios / permisos'),('Acceso a datos','SQLAlchemy async + asyncpg'),('Base de datos','PostgreSQL en Supabase')]
            for i,(label,sub) in enumerate(nodes):
                y=265-i*57;box(120,y,255,label,sub)
                if i<4:arrow(247,y,247,y-19)
            c.setFont('Stage',8);c.setFillColor(INK);c.drawCentredString(WIDTH/2,9,'Web/API: HTTPS y cookie. Backend/BD: TLS y rol runtime.')
        else:
            # Todas las entidades del Mermaid del núcleo; las FK completas están en §8.2.
            nodes={'USUARIOS':(0,250),'ROLES':(128,250),'USUARIO_ROLES':(256,250),'TERAPEUTAS':(384,250),'TUTORES':(0,190),'PACIENTES':(128,190),'TURNOS_SEMANALES':(256,190),'BLOQUEOS_AGENDA':(384,190),'EXPEDIENTES':(128,130),'RESERVAS':(256,130),'TRATAMIENTOS':(128,70),'SESIONES':(256,70),'REPORTES_SESION':(384,70)}
            c.setStrokeColor(TEAL);c.setLineWidth(1)
            for left,right in [('USUARIOS','TUTORES'),('USUARIOS','TERAPEUTAS'),('USUARIOS','USUARIO_ROLES'),('ROLES','USUARIO_ROLES'),('TUTORES','PACIENTES'),('PACIENTES','EXPEDIENTES'),('EXPEDIENTES','TRATAMIENTOS'),('TERAPEUTAS','TRATAMIENTOS'),('PACIENTES','RESERVAS'),('TERAPEUTAS','RESERVAS'),('TRATAMIENTOS','RESERVAS'),('RESERVAS','SESIONES'),('SESIONES','REPORTES_SESION'),('SESIONES','TRATAMIENTOS'),('TERAPEUTAS','TURNOS_SEMANALES'),('TERAPEUTAS','BLOQUEOS_AGENDA')]:
                x1,y1=nodes[left];x2,y2=nodes[right];c.line(x1+54,y1+19,x2+54,y2+19)
            for label,(x,y) in nodes.items():
                c.setFillColor(colors.HexColor('#F5F3FF'));c.setStrokeColor(colors.HexColor('#C4BAE0'));c.roundRect(x,y,108,38,7,fill=1,stroke=1)
                c.setFillColor(INK);c.setFont('StageBold',6.8);c.drawCentredString(x+54,y+19,label)
            c.setFont('Stage',8);c.drawCentredString(WIDTH/2,35,'Núcleo. Cardinalidades y 41 FK físicas: tabla completa en §8.2.')

class Doc(SimpleDocTemplate):
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and f.style.name in ['h2','h3']:
            name='s'+str(self.seq.nextf('section'));self.canv.bookmarkPage(name)
            self.canv.addOutlineEntry(f.getPlainText(),name,0 if f.style.name=='h2' else 1,False)

def table(lines):
    data=[]
    for idx,line in enumerate(lines):
        if re.match(r'^\|\s*:?-+',line):continue
        values=[v.strip().replace('\\|','|') for v in re.split(r'(?<!\\)\|',line.strip().strip('|'))]
        data.append([Paragraph(inline(v),styles['th' if idx==0 else 'cell']) for v in values])
    n=len(data[0]); widths=[WIDTH/n]*n
    heads=[p.getPlainText() for p in data[0]]
    if heads==['Método','Ruta pública','Resumen OpenAPI']:widths=[45,280,WIDTH-325]
    elif heads[0]=='Campo': widths=[145,110,55,WIDTH-310]
    elif n==2: widths=[WIDTH*.26,WIDTH*.74]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    pad=4 if heads[0]=='Punto solicitado / página' else 5 if heads[0]=='Activo / riesgo' else 6
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),VIOLET),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),pad),('BOTTOMPADDING',(0,0),(-1,-1),pad),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F8F7FB')]),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#E8E5F4'))]))
    return t

def render(source,output,title):
    lines=source.read_text(encoding='utf-8').splitlines();story=[];i=0
    while i<len(lines):
        line=lines[i].strip()
        if not line:i+=1;continue
        if line.startswith('```'):
            language=line[3:];block=[];i+=1
            while i<len(lines) and not lines[i].strip().startswith('```'):block.append(lines[i]);i+=1
            if language=='mermaid':story.append(Diagram('architecture' if any('flowchart' in x for x in block) else 'erd'))
            else:story.append(Paragraph('<br/>'.join(escape(x).replace(' ','&#160;') for x in block),styles['code']))
            i+=1;continue
        if line.startswith('|'):
            block=[]
            while i<len(lines) and lines[i].strip().startswith('|'):block.append(lines[i].strip());i+=1
            story.extend([table(block),Spacer(1,10)]);continue
        if line.startswith('#'):
            level=len(line)-len(line.lstrip('#'));key='title' if level==1 else 'h2' if level==2 else 'h3' if level==3 else 'h4'
            if level==2 and story:story.append(PageBreak())
            story.append(Paragraph(inline(line.lstrip('#').strip()),styles[key]));i+=1;continue
        if line.startswith('<!--'):i+=1;continue
        if line.startswith('- '):line='• '+line[2:]
        if line.startswith('> '):line=line[2:]
        story.append(Paragraph(inline(line),styles['body']));i+=1
    def page(c,doc):
        c.saveState();c.setStrokeColor(colors.HexColor('#E8E5F4'));c.line(50,42,A4[0]-50,42)
        c.setFillColor(colors.HexColor('#615274'));c.setFont('Stage',7.5)
        c.drawString(50,28,'ASHAKids | V46 | 10 octubre 2026 | Fuente documental')
        c.drawRightString(A4[0]-50,28,f'{doc.page}')
        if doc.page>1:c.drawString(50,A4[1]-28,title)
        c.restoreState()
    doc=Doc(str(output),pagesize=A4,leftMargin=50,rightMargin=50,topMargin=49,bottomMargin=57,title=title,author='Equipo ASHAKids',pageCompression=1)
    doc.build(story,onFirstPage=page,onLaterPages=page)

if __name__=='__main__':
    files=[('DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md','Documentacion_Maestra_ASHAKids_V46.pdf','Documentación maestra - etapa funcional'),('GUIA_FLUJO_ESTADO_Y_PENDIENTES.md','Guia_Flujo_Equipo_ASHAKids_V46.pdf','Flujo actual y base del equipo')]
    for source,filename,title in files:
        render(ROOT/'docs'/source,OUT/filename,title);print(filename)
