"""Asset specification for Codex BE. No runtime integration."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[3]
PEOPLE=[
('k3h_troedlerin','Ida Marrow, 60 year old widow, grey hair bun, shift coat over dress, spectacles on chain, holding someone else’s brown hat'),
('k3h_steinmetz','Bram Tolley, broad stone mason, chalk dusty leather apron, hammer on belt, narrow mouth, cropped dark beard'),
('k3h_lampenwart','Cato Finch, gaunt signal keeper, insignia-free uniform, tool roll and signal lantern with muted green glass'),
('zirkel_schichtbund','Agathe Rooke, upright woman aged 70, shift foreman coat, tally stick necklace, stamp hanging from ribbon'),
('tm_ds_lampe','Wim, friendly smiling soot covered lamp cleaner, rag over shoulder, flat cap'),
('tm_ds_kerbholz','Dora, tally clerk woman, small carving knife and wooden tally stick, apron full of wood shavings'),
('tm_ds_stimme','Rufus, wax cylinder merchant, open case full of wax cylinders, hearing tube around neck'),
('ez_ds_rangierer','Holm Varley, sturdy shunter with coupling hook, leather gloves, ochre signal vest'),
('ez_ds_kalkbrennerin','Senta Quill, woman covered in white chalk, cloth over mouth, glass flask on belt'),
('ez_ds_streckenlaeufer','Gaunt railway runner, pocket watch on long chain, running shoes, counting stick'),
('ez_ds_walzenstimme','Jory Pell, boy aged 12, phonograph horn worn as hat, oversized brown coat, turquoise voice rings'),
('ez_ds_schrankenkind','Wenna, girl aged 9, notched strings around arms, small railway barrier staff, moss brown clothing'),
('k3e_schichtwitwe','Widow in grey shawl carrying a basket of potatoes'),
('k3e_kalkjunge','Barefoot boy carrying a piece of chalk, dusty cap and short trousers'),
('k3e_wagenputzer','Rail carriage cleaner with bucket and rag, ochre work shirt'),
('k3e_zeitungsfrau','Lotte, newspaper woman with large newspaper shoulder bag, rust coat'),
('k3e_bahnbettler','Old railway beggar wrapped in patched blanket, tin cup'),
('k3e_steinmetzgeselle','Young stone mason apprentice with chisel and leather apron'),
('k3e_teesaalgast','Tea room guest with bowler hat and folded newspaper'),
('k3e_signalkind','Child with a small ochre signal flag, slate overalls'),
('k3e_aufseher_a','Stocky male railway inspector in slate uniform, lantern and railway signal paddle'),
('k3e_aufseher_b','Tall female railway inspector in rust trimmed slate uniform, lantern and railway signal paddle')]
ENEMIES=[
('k3k_kupferdieb','Copper thief, coat covered in cable coils, large pliers','plier strike','cable snare'),
('k3k_schienenlaeufer','Coal dusty railway runner, train coupling used as club','coupling club strike','escape dash'),
('k3k_lohnfaelscher','Payroll forger with ink stained fingers, wage ledger held as shield','ledger bash','ink splash'),
('k3k_staubschmuggler','Masked chalk smuggler carrying sacks of limestone powder','blinding dust throw','sack swing'),
('k3k_walzenhehler','Wax cylinder fence with case, phonograph horn on back','cylinder throw','turquoise echo summoning cast'),
('k3k_signalbrecher','Rail signal saboteur, insignia-free uniform, two signal whistles and chalk mask','phase one whistle blast','phase two summoning spectral workers')]
ATTACKS=[('hook strike','shoulder bash'),('chalk dust cloud','glass flask throw'),('counting stick beat','time skip with separated afterimage'),('turquoise voice rings','echo double'),('evasive sidestep','one pebble throw')]
style=(ROOT/'docs/art/codex_BE_dunscar_figuren2.md').read_text().split('```')[1].strip()
style+='\nSetting override: Dunscar, a disused Victorian limestone mining and railway town on a treeless plateau. Chalk white, ochre, rust and slate. Match attached reference palette and proportions. Transparent background. No labels, text, grids or panel borders. Each cell completely isolated with clear transparent margin. Do not add shadows, fog, dust or glows outside the subject silhouette. '
JOBS=[]
def job(file,kind,fw,fh,cols,rows,subject,layout,**extra):
    JOBS.append(dict(file=file,kind=kind,frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,subject=subject,prompt=style+'\nSubject: '+subject+'\n'+layout,**extra))
walk='One walking sprite sheet, FOUR equal columns and FOUR equal rows. Logical size 64x128, each cell 16x32. Row 1 facing DOWN toward viewer, row 2 facing LEFT, row 3 facing RIGHT, row 4 facing UP away from viewer. Four genuinely different alternating walking steps in each row, full body, feet on same baseline, consistent scale. No portraits.'
for id,desc in PEOPLE:
    job(f'characters/{id}_walk.png','walk',16,32,4,4,desc,walk,gameId=id)
    if id.startswith('k3e_'): continue
    for suffix,emotions in [('', ['neutral','suspicious','startled','slight smile']),('2',['angry','sad','thoughtful','determined'])]:
        file=f'portraits/{id}_emotions.png' if not suffix else f'portraits/AK_{id}_emotions2.png'
        job(file,'portraits',64,64,4,1,desc,'One portrait expression sheet: FOUR equally sized square cells in ONE horizontal row. Logical 256x64. Four busts of SAME person, same scale, same head angle, same clothing, face clearly different each cell. Left to right: '+', '.join(emotions)+'. Deliberate crisp low resolution pixel art, no tiny details.',gameId=id,expressions=emotions)
for id,desc in PEOPLE:
    if id in ['k3e_wagenputzer','k3e_steinmetzgeselle']:
        job(f'characters/{id}_schicht.png','walk',16,32,4,4,desc+', sleepwalking with eyes closed, carrying a lantern',walk,gameId=id)
for id,desc,a,b in ENEMIES:
    job(f'characters/F_ow_{id}.png','overworld',16,32,4,4,desc,walk,gameId=id)
for (id,desc),(a,b) in list(zip(PEOPLE[7:12],ATTACKS))+[((id,desc),(a,b)) for id,desc,a,b in ENEMIES]:
    size=64 if id=='k3k_signalbrecher' else 48
    end='sits down unharmed, staff lowered' if id=='ez_ds_schrankenkind' else 'surrenders or crouches exhausted, no wounds'
    layout=f'One combat animation sheet, SIX equal columns by FIVE equal rows. Logical {size*6}x{size*5}, cells {size}x{size}. Full-body enemy facing LEFT throughout, same ground baseline. Row 1: four idle breathing frames then two EMPTY cells. Row 2: six frames of {a}: ready, windup, SAME held windup, release, impact, recover. Row 3: six frames of {b}: ready, windup, SAME held windup, release, impact, recover. Row 4: three hurt/recoil frames then three EMPTY cells. Row 5: four defeat frames ({end}) then two EMPTY cells. Clearly different poses and arm positions. No gore. Children are never injured. Effects fit inside their own cells.'
    job(f'battle/enemy_{id}.png','battle',size,size,6,5,desc,layout,gameId=id,attackNames=[a,b])
for file,w,h,desc in [
('BE_troedelstand',32,32,'Victorian thrift market stall with used hats and coats'),
('BE_steinmetzwerkbank',48,32,'Stone mason workbench with blank headstone, chisels and hammer, no inscription'),
('BE_schaltbuden_theke',32,32,'Signal hut counter with signal lamps and wire spools'),
('BE_lichtkegel',64,64,'Single broad triangular warm amber lantern light cone, deliberate two tone pixel checker dithering for transparency, tip top centre, wide base bottom, no lantern, no scenery')]:
    job(f'props/{file}.png','prop',w,h,1,1,desc,f'One standalone top-down 3/4 pixel art prop. Logical resolution {w}x{h}, centered, transparent margin.')
job('props/BE_schichtbund.png','atlas',64,64,4,2,'Schichtbund secret railway workers society props','One prop atlas with FOUR equal columns and TWO equal rows. Each cell logical 64x64. Row 1: tally-stick wall cabinet; stamp desk; wax-cylinder shelf; horizontal row of hanging lamps. Row 2: long assembly bench; small circular emblem with a notch; small brass city map pin showing same notched circle; EMPTY. No text.',regions=[['kerbholz_wand',48,48],['stempeltisch',32,32],['walzenregal',32,48],['lampenreihe',64,16],['versammlungsbank',48,16],['bodenmarke',16,16],['stadtkarten_pin',16,16]])
for (id,*_),desc in zip(ENEMIES,['copper cable coil','heavy railway coupling','inkwell with stained nib','chalk sack seal','wax phonograph cylinder','double signal whistle']):
    job(f'items/{id}_trophaee.png','icon',16,16,1,1,desc,'One inventory trophy icon, logical resolution 16x16. Large readable silhouette, very few pixel clusters, 1px bluegrey outline. No text. Transparent margin.',gameId=id)
if __name__=='__main__':
    path=ROOT/'docs/art/dunscar5-source-spec.json'
    path.write_text(json.dumps(dict(batch='dunscar5',people=PEOPLE,enemies=ENEMIES,jobs=JOBS),ensure_ascii=False,indent=2)+'\n')
    print(len(JOBS),'generation jobs')
