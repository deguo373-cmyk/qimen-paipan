/**
 * 周易（易经）模块 — 六十四卦起卦、速查
 * 数据来源：《周易译注》（黄寿祺）、《周易正义》（王弼、孔颖达）、《易传》
 * 挂载到 window.YIJING
 */
(function(){
  'use strict';

  // ═══════════════════════════════════════════════════════
  // 八卦基础数据
  // ═══════════════════════════════════════════════════════
  var BAGUA = {
    qian:  { name:'乾', symbol:'☰', image:'三连', nature:'天', wuxing:'金', index:0 },
    dui:   { name:'兑', symbol:'☱', image:'上缺', nature:'泽', wuxing:'金', index:1 },
    li:    { name:'离', symbol:'☲', image:'中虚', nature:'火', wuxing:'火', index:2 },
    zhen:  { name:'震', symbol:'☳', image:'仰盂', nature:'雷', wuxing:'木', index:3 },
    xun:   { name:'巽', symbol:'☴', image:'下缺', nature:'风', wuxing:'木', index:4 },
    kan:   { name:'坎', symbol:'☵', image:'中满', nature:'水', wuxing:'水', index:5 },
    gen:   { name:'艮', symbol:'☶', image:'覆碗', nature:'山', wuxing:'土', index:6 },
    kun:   { name:'坤', symbol:'☷', image:'六断', nature:'地', wuxing:'土', index:7 }
  };

  // 八卦数组方便按索引查找
  var BAGUA_LIST = [BAGUA.qian, BAGUA.dui, BAGUA.li, BAGUA.zhen, BAGUA.xun, BAGUA.kan, BAGUA.gen, BAGUA.kun];

  // 八卦名称→对象映射
  var BAGUA_MAP = {};
  BAGUA_LIST.forEach(function(g){ BAGUA_MAP[g.name] = g; });

  // ═══════════════════════════════════════════════════════
  // 六十四卦完整数据
  // ═══════════════════════════════════════════════════════
  var HEXAGRAMS = [
    { index:1,  symbol:'䷀', name:'乾',   pinyin:'qián',     upper:'乾', lower:'乾',
      guaci:'元亨利贞。四德俱全，创始、通达、和谐、正固。',
      tuan:'天行健，乾道变化，各正性命；万物资始，统天。',
      xiang:'天行健，君子以自强不息。',
      modern:'事业开创期，宜主动进取、坚持原则。领导力、创业、大格局之事。' },
    { index:2,  symbol:'䷁', name:'坤',   pinyin:'kūn',      upper:'坤', lower:'坤',
      guaci:'元亨，利牝马之贞。君子有攸往，先迷后得主。',
      tuan:'坤厚载物，德合无疆；含弘光大，品物咸亨。',
      xiang:'地势坤，君子以厚德载物。',
      modern:'配合、承载、培育的阶段。宜守成、包容、不要强出头。适合管理、教育、滋养型事务。' },
    { index:3,  symbol:'䷂', name:'屯',   pinyin:'zhūn',     upper:'坎', lower:'震',
      guaci:'元亨利贞。勿用有攸往，利建侯。',
      tuan:'刚柔始交而难生，动乎险中，大亨贞。',
      xiang:'云雷屯，君子以经纶。',
      modern:'事物初生、充满艰险的阶段。宜稳固根基、建立团队，而非冒进扩张。创业初期、新项目的启动期。' },
    { index:4,  symbol:'䷃', name:'蒙',   pinyin:'méng',     upper:'艮', lower:'坎',
      guaci:'亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。',
      tuan:'山下有险，险而止，蒙。蒙亨，以亨行时中也。',
      xiang:'山下出泉，蒙。君子以果行育德。',
      modern:'蒙昧待启、教育学习的阶段。学生需主动求知，老师应适度引导。适合教育、启蒙、咨询场景。' },
    { index:5,  symbol:'䷄', name:'需',   pinyin:'xū',       upper:'坎', lower:'乾',
      guaci:'有孚，光亨，贞吉。利涉大川。',
      tuan:'需，须也。险在前也，刚健而不陷。',
      xiang:'云上于天，需。君子以饮食宴乐。',
      modern:'等待时机的阶段。有诚信则光明通达。不急躁，养精蓄锐以待天时。谈判、等待批复、市场观察期。' },
    { index:6,  symbol:'䷅', name:'讼',   pinyin:'sòng',     upper:'乾', lower:'坎',
      guaci:'有孚窒惕，中吉，终凶。利见大人，不利涉大川。',
      tuan:'讼，上刚下险，险而健，讼。',
      xiang:'天与水违行，讼。君子以作事谋始。',
      modern:'争讼、分歧的阶段。适可而止则吉，纠缠到底则凶。宜在开始时就把规则定好。法律纠纷、合同争议、意见不合。' },
    { index:7,  symbol:'䷆', name:'师',   pinyin:'shī',      upper:'坤', lower:'坎',
      guaci:'贞，丈人吉，无咎。',
      tuan:'师，众也。贞，正也。能以众正，可以王矣。',
      xiang:'地中有水，师。君子以容民畜众。',
      modern:'统率、出兵、集体行动。需有德高望重者统率。团队管理、组织动员、竞争对抗。' },
    { index:8,  symbol:'䷇', name:'比',   pinyin:'bǐ',       upper:'坎', lower:'坤',
      guaci:'吉。原筮元永贞，无咎。不宁方来，后夫凶。',
      tuan:'比，吉也。比，辅也，下顺从也。',
      xiang:'地上有水，比。先王以建万国，亲诸侯。',
      modern:'亲附、团结、合作。择善而依附，亲贤远佞。人际关系建设、团队凝聚、合作联盟。' },
    { index:9,  symbol:'䷈', name:'小畜', pinyin:'xiǎo xù',  upper:'巽', lower:'乾',
      guaci:'亨。密云不雨，自我西郊。',
      tuan:'柔得位而上下应之，曰小畜。健而巽，刚中而志行。',
      xiang:'风行天上，小畜。君子以懿文德。',
      modern:'小有积蓄、力量尚不充分。云已聚但雨未下，酝酿阶段。不宜急于求成。积蓄能力、等待突破。' },
    { index:10, symbol:'䷉', name:'履',   pinyin:'lǚ',       upper:'乾', lower:'兑',
      guaci:'履虎尾，不咥人，亨。',
      tuan:'履，柔履刚也。说而应乎乾，是以履虎尾不咥人，亨。',
      xiang:'上天下泽，履。君子以辨上下，定民志。',
      modern:'踩老虎尾巴般危险但安全通过。处事谨慎、循礼而行。高风险但有准备的行动、职场晋升。' },
    { index:11, symbol:'䷊', name:'泰',   pinyin:'tài',      upper:'坤', lower:'乾',
      guaci:'小往大来，吉亨。',
      tuan:'天地交而万物通，上下交而其志同。',
      xiang:'天地交泰，后以财成天地之道，辅相天地之宜。',
      modern:'阴阳交泰、万物通畅。事业顺遂、人际关系和谐。是发展、合作、交流的最佳时期。' },
    { index:12, symbol:'䷋', name:'否',   pinyin:'pǐ',       upper:'乾', lower:'坤',
      guaci:'否之匪人，不利君子贞，大往小来。',
      tuan:'天地不交而万物不通，上下不交而天下无邦。',
      xiang:'天地不交，否。君子以俭德辟难，不可荣以禄。',
      modern:'闭塞不通、君子道消。宜收敛退守、韬光养晦，不宜强求。经济下行期、人际关系冷淡、事业瓶颈。' },
    { index:13, symbol:'䷌', name:'同人', pinyin:'tóng rén', upper:'乾', lower:'离',
      guaci:'同人于野，亨。利涉大川，利君子贞。',
      tuan:'同人，柔得位得中而应乎乾。唯君子为能通天下之志。',
      xiang:'天与火，同人。君子以类族辨物。',
      modern:'与人和同、志同道合。打破隔阂、广泛合作。团队建设、跨部门协作、资源共享。' },
    { index:14, symbol:'䷍', name:'大有', pinyin:'dà yǒu',   upper:'离', lower:'乾',
      guaci:'元亨。',
      tuan:'柔得尊位，大中而上下应之，曰大有。其德刚健而文明。',
      xiang:'火在天上，大有。君子以遏恶扬善，顺天休命。',
      modern:'大丰收、富有。事业鼎盛、物阜民丰。宜回报社会、积善行德。财富管理、企业盛期。' },
    { index:15, symbol:'䷎', name:'谦',   pinyin:'qiān',     upper:'坤', lower:'艮',
      guaci:'亨，君子有终。',
      tuan:'天道亏盈而益谦，地道变盈而流谦……谦尊而光，卑而不可逾。',
      xiang:'地中有山，谦。君子以裒多益寡，称物平施。',
      modern:'谦虚处世、内高外低。满招损谦受益，越是高位越要谦逊。个人修养、领导艺术、危机管理。' },
    { index:16, symbol:'䷏', name:'豫',   pinyin:'yù',       upper:'震', lower:'坤',
      guaci:'利建侯行师。',
      tuan:'豫，刚应而志行，顺以动。豫之时义大矣哉！',
      xiang:'雷出地奋，豫。先王以作乐崇德。',
      modern:'安乐愉悦、顺势而动。时机到了，可以有所作为，但不可沉迷享乐。时机成熟后的果断行动。' },
    { index:17, symbol:'䷐', name:'随',   pinyin:'suí',      upper:'兑', lower:'震',
      guaci:'元亨利贞，无咎。',
      tuan:'刚来而下柔，动而说，随。大亨贞无咎，而天下随时。',
      xiang:'泽中有雷，随。君子以向晦入宴息。',
      modern:'随顺、跟随。适时调整、因时制宜。顺应潮流但不盲从。市场跟随策略、个人适应变化。' },
    { index:18, symbol:'䷑', name:'蛊',   pinyin:'gǔ',       upper:'艮', lower:'巽',
      guaci:'元亨。利涉大川，先甲三日，后甲三日。',
      tuan:'蛊，刚上而柔下，巽而止，蛊。蛊元亨而天下治也。',
      xiang:'山下有风，蛊。君子以振民育德。',
      modern:'整治腐败、拨乱反正。问题积累已久，需从源头治理。组织变革、企业整顿、修复关系。' },
    { index:19, symbol:'䷒', name:'临',   pinyin:'lín',      upper:'坤', lower:'兑',
      guaci:'元亨利贞。至于八月有凶。',
      tuan:'临，刚浸而长，说而顺，刚中而应。',
      xiang:'泽上有地，临。君子以教思无穷，容保民无疆。',
      modern:'临近、面对、监临。居高临下地对待事物。宜以包容和智慧应对。管理者指导下属、面临重大决策。' },
    { index:20, symbol:'䷓', name:'观',   pinyin:'guān',     upper:'巽', lower:'坤',
      guaci:'盥而不荐，有孚颙若。',
      tuan:'大观在上，顺而巽，中正以观天下。观天之神道，而四时不忒。',
      xiang:'风行地上，观。先王以省方观民设教。',
      modern:'观察、观摩。以冷静眼光审时度势。不宜急于行动，先看清楚。市场调研、学习观察、自我反思。' },
    { index:21, symbol:'䷔', name:'噬嗑', pinyin:'shì kē',   upper:'离', lower:'震',
      guaci:'亨。利用狱。',
      tuan:'颐中有物曰噬嗑。刚柔分，动而明。',
      xiang:'雷电噬嗑。先王以明罚敕法。',
      modern:'咬合、清除障碍。用强硬手段解决问题。处理纠纷、执法、扫除障碍。' },
    { index:22, symbol:'䷕', name:'贲',   pinyin:'bì',       upper:'艮', lower:'离',
      guaci:'亨。小利有攸往。',
      tuan:'贲亨。柔来而文刚，故亨。观乎天文以察时变，观乎人文以化成天下。',
      xiang:'山下有火，贲。君子以明庶政，无敢折狱。',
      modern:'文饰、修饰。外表美化与文化修养。适当包装重要，但不可本末倒置。品牌设计、礼仪修养、审美提升。' },
    { index:23, symbol:'䷖', name:'剥',   pinyin:'bō',       upper:'艮', lower:'坤',
      guaci:'不利有攸往。',
      tuan:'剥，剥也。柔变刚也。顺而止之，观象也。',
      xiang:'山附于地，剥。上以厚下安宅。',
      modern:'剥落、衰退。小人道长君子道消，宜守不宜攻。下行周期中的保全策略、保护根基。' },
    { index:24, symbol:'䷗', name:'复',   pinyin:'fù',       upper:'坤', lower:'震',
      guaci:'亨。出入无疾，朋来无咎。反复其道，七日来复。',
      tuan:'复亨。刚反。动而以顺行。复其见天地之心乎！',
      xiang:'雷在地中，复。先王以至日闭关，商旅不行。',
      modern:'回归、复苏、一阳来复。否极泰来的转折点。从低谷反弹的时机。经济复苏、关系修复、康复。' },
    { index:25, symbol:'䷘', name:'无妄', pinyin:'wú wàng',  upper:'乾', lower:'震',
      guaci:'元亨利贞。其匪正有眚，不利有攸往。',
      tuan:'无妄，刚自外来而为主于内。动而健，刚中而应。天命不佑，行矣哉？',
      xiang:'天下雷行，物与无妄。先王以茂对时育万物。',
      modern:'不妄为、顺天应时。坚守正道，不做非分之想。意外变故时保持冷静。投资中的理性决策。' },
    { index:26, symbol:'䷙', name:'大畜', pinyin:'dà chù',   upper:'艮', lower:'乾',
      guaci:'利贞。不家食吉。利涉大川。',
      tuan:'大畜，刚健笃实辉光，日新其德。刚上而尚贤。',
      xiang:'天在山中，大畜。君子以多识前言往行，以畜其德。',
      modern:'大积蓄、厚积薄发。积累知识、德性、资源。宜学习、储备，为大事做准备。人才储备、长期投资。' },
    { index:27, symbol:'䷚', name:'颐',   pinyin:'yí',       upper:'艮', lower:'震',
      guaci:'贞吉。观颐，自求口实。',
      tuan:'颐，贞吉。养正则吉也。天地养万物，圣人养贤以及万民。',
      xiang:'山下有雷，颐。君子以慎言语，节饮食。',
      modern:'颐养、养生。自我滋养、言语谨慎、饮食有节。健康管理、持续学习、修身养性。' },
    { index:28, symbol:'䷛', name:'大过', pinyin:'dà guò',   upper:'兑', lower:'巽',
      guaci:'栋桡。利有攸往，亨。',
      tuan:'大过，大者过也。栋桡，本末弱也。刚过而中，巽而说行。',
      xiang:'泽灭木，大过。君子以独立不惧，遁世无闷。',
      modern:'过度、非常规。栋梁弯曲，需非常手段应对。危机中的非常之举。非常时期用非常手段。' },
    { index:29, symbol:'䷜', name:'坎',   pinyin:'kǎn',      upper:'坎', lower:'坎',
      guaci:'习坎，有孚，维心亨。行有尚。',
      tuan:'习坎，重险也。水流而不盈，行险而不失其信。',
      xiang:'水洊至，习坎。君子以常德行，习教事。',
      modern:'险难重重、重险。面对多重困难，以诚信和恒心渡过。危机管理、心理韧性训练。' },
    { index:30, symbol:'䷝', name:'离',   pinyin:'lí',       upper:'离', lower:'离',
      guaci:'利贞，亨。畜牝牛，吉。',
      tuan:'离，丽也。日月丽乎天，百谷草木丽乎土。重明以丽乎正，乃化成天下。',
      xiang:'明两作，离。大人以继明照于四方。',
      modern:'附丽、光明。需依附于正道。文明、文化、智慧。宜保持柔顺中正。品牌依附、文化传承、学习照明。' },
    // 下经（31–64）
    { index:31, symbol:'䷞', name:'咸',   pinyin:'xián',     upper:'兑', lower:'艮',
      guaci:'亨，利贞。取女吉。',
      tuan:'咸，感也。柔上而刚下，二气感应以相与。天地感而万物化生。',
      xiang:'山上有泽，咸。君子以虚受人。',
      modern:'感应、感通。以虚怀若谷之心与人交流。感情、人际关系、合作洽谈。' },
    { index:32, symbol:'䷟', name:'恒',   pinyin:'héng',     upper:'震', lower:'巽',
      guaci:'亨，无咎。利贞。利有攸往。',
      tuan:'恒，久也。刚上而柔下，雷风相与。天地之道，恒久而不已也。',
      xiang:'雷风，恒。君子以立不易方。',
      modern:'持久、守恒。守持正道、持之以恒。经营事业、经营婚姻、坚持长期主义。' },
    { index:33, symbol:'䷠', name:'遁',   pinyin:'dùn',      upper:'乾', lower:'艮',
      guaci:'亨。小利贞。',
      tuan:'遁亨，遁而亨也。刚当位而应，与时行也。',
      xiang:'天下有山，遁。君子以远小人，不恶而严。',
      modern:'退隐、退让。时机不利时退守保存。急流勇退、规避风险。不宜正面冲突。' },
    { index:34, symbol:'䷡', name:'大壮', pinyin:'dà zhuàng',upper:'震', lower:'乾',
      guaci:'利贞。',
      tuan:'大壮，大者壮也。刚以动，故壮。正大而天地之情可见矣。',
      xiang:'雷在天上，大壮。君子以非礼弗履。',
      modern:'盛大、强盛。力量充足但需以正道驾驭，不可滥用。事业发展高峰期但需克制。' },
    { index:35, symbol:'䷢', name:'晋',   pinyin:'jìn',      upper:'离', lower:'坤',
      guaci:'康侯用锡马蕃庶，昼日三接。',
      tuan:'晋，进也。明出地上，顺而丽乎大明。',
      xiang:'明出地上，晋。君子以自昭明德。',
      modern:'晋升、前进。如日出大地，光明磊落地向上。升职、进步、事业拓展。' },
    { index:36, symbol:'䷣', name:'明夷', pinyin:'míng yí',  upper:'坤', lower:'离',
      guaci:'利艰贞。',
      tuan:'明入地中，明夷。内文明而外柔顺，以蒙大难。',
      xiang:'明入地中，明夷。君子以莅众，用晦而明。',
      modern:'光明受损、暗夜。环境恶劣时收敛锋芒，隐忍等待。不宜出头。困境中的保全策略。' },
    { index:37, symbol:'䷤', name:'家人', pinyin:'jiā rén',  upper:'巽', lower:'离',
      guaci:'利女贞。',
      tuan:'家人，女正位乎内，男正位乎外。父父、子子、兄兄、弟弟、夫夫、妇妇。',
      xiang:'风自火出，家人。君子以言有物而行有恒。',
      modern:'家庭、家族。各安其位、各尽其责。家庭关系、团队文化建设、公司治理。' },
    { index:38, symbol:'䷥', name:'睽',   pinyin:'kuí',      upper:'离', lower:'兑',
      guaci:'小事吉。',
      tuan:'睽，火动而上，泽动而下。二女同居，其志不同行。睽之时用大矣哉！',
      xiang:'上火下泽，睽。君子以同而异。',
      modern:'乖离、分歧。意见不合时求同存异，从小处入手可吉。差异管理、多元包容。' },
    { index:39, symbol:'䷦', name:'蹇',   pinyin:'jiǎn',     upper:'坎', lower:'艮',
      guaci:'利西南，不利东北。利见大人，贞吉。',
      tuan:'蹇，难也，险在前也。见险而能止，知矣哉！',
      xiang:'山上有水，蹇。君子以反身修德。',
      modern:'艰难、跛行。前有险阻，宜反躬自省、修养德性。困难时期的自我提升。' },
    { index:40, symbol:'䷧', name:'解',   pinyin:'xiè',      upper:'震', lower:'坎',
      guaci:'利西南。无所往，其来复吉。有攸往，夙吉。',
      tuan:'解，险以动，动而免乎险，解。天地解而雷雨作。',
      xiang:'雷雨作，解。君子以赦过宥罪。',
      modern:'解脱、化解。危险解除，宜宽大处理。摆脱困境、释放压力、危机解除后的重建。' },
    { index:41, symbol:'䷨', name:'损',   pinyin:'sǔn',      upper:'艮', lower:'兑',
      guaci:'有孚，元吉，无咎，可贞。利有攸往。曷之用？二簋可用享。',
      tuan:'损下益上，其道上行。损而有孚，元吉。',
      xiang:'山下有泽，损。君子以惩忿窒欲。',
      modern:'减损、克制。合理减损以获取更大利益。克制情绪、精简开支、以退为进。' },
    { index:42, symbol:'䷩', name:'益',   pinyin:'yì',       upper:'巽', lower:'震',
      guaci:'利有攸往，利涉大川。',
      tuan:'益，损上益下，民说无疆。天施地生，其益无方。',
      xiang:'风雷，益。君子以见善则迁，有过则改。',
      modern:'增益、利益。上施下受、惠及大众。慈善、投资回报、改善民生。' },
    { index:43, symbol:'䷪', name:'夬',   pinyin:'guài',     upper:'兑', lower:'乾',
      guaci:'扬于王庭，孚号有厉。告自邑，不利即戎。利有攸往。',
      tuan:'夬，决也。刚决柔也。健而说，决而和。',
      xiang:'泽上于天，夬。君子以施禄及下，居德则忌。',
      modern:'决断、果决。公开裁决，果断解决。适合清理、断舍离、做艰难决定。' },
    { index:44, symbol:'䷫', name:'姤',   pinyin:'gòu',      upper:'乾', lower:'巽',
      guaci:'女壮，勿用取女。',
      tuan:'姤，遇也，柔遇刚也。天地相遇，品物咸章。',
      xiang:'天下有风，姤。后以施命诰四方。',
      modern:'不期而遇、邂逅。机遇与风险并存，需谨慎选择。新的相遇、意外机会、情感缘分。' },
    { index:45, symbol:'䷬', name:'萃',   pinyin:'cuì',      upper:'兑', lower:'坤',
      guaci:'亨。王假有庙。利见大人，亨，利贞。用大牲吉，利有攸往。',
      tuan:'萃，聚也。顺以说，刚中而应，故聚也。',
      xiang:'泽上于地，萃。君子以除戎器，戒不虞。',
      modern:'聚集、荟萃。人才汇聚、资源整合。组织聚会、团队建设、行业峰会。' },
    { index:46, symbol:'䷭', name:'升',   pinyin:'shēng',    upper:'坤', lower:'巽',
      guaci:'元亨。用见大人，勿恤。南征吉。',
      tuan:'柔以时升，巽而顺，刚中而应。',
      xiang:'地中生木，升。君子以顺德，积小以高大。',
      modern:'上升、晋升。如树木生长，积小成大。稳步上升、事业发展、学业进步。' },
    { index:47, symbol:'䷮', name:'困',   pinyin:'kùn',      upper:'兑', lower:'坎',
      guaci:'亨，贞大人吉，无咎。有言不信。',
      tuan:'困，刚掩也。险以说，困而不失其所亨。',
      xiang:'泽无水，困。君子以致命遂志。',
      modern:'困厄、困境。虽处困境但守正自持。言语不被信任时保持沉默。逆境中的坚持与自我提升。' },
    { index:48, symbol:'䷯', name:'井',   pinyin:'jǐng',     upper:'坎', lower:'巽',
      guaci:'改邑不改井，无丧无得。往来井井。汔至亦未繘井，羸其瓶，凶。',
      tuan:'巽乎水而上水，井。井养而不穷也。',
      xiang:'木上有水，井。君子以劳民劝相。',
      modern:'滋养、源头。如井水取之不竭，持续提供价值。稳定收益、基层建设、公益事业。' },
    { index:49, symbol:'䷰', name:'革',   pinyin:'gé',       upper:'兑', lower:'离',
      guaci:'己日乃孚。元亨利贞，悔亡。',
      tuan:'革，水火相息。天地革而四时成。汤武革命，顺乎天而应乎人。',
      xiang:'泽中有火，革。君子以治历明时。',
      modern:'变革、改革。时机成熟时的彻底转变。组织变革、技术迭代、制度更新。' },
    { index:50, symbol:'䷱', name:'鼎',   pinyin:'dǐng',     upper:'离', lower:'巽',
      guaci:'元吉，亨。',
      tuan:'鼎，象也。以木巽火，亨饪也。圣人亨以享上帝，而大亨以养圣贤。',
      xiang:'木上有火，鼎。君子以正位凝命。',
      modern:'鼎立、鼎新。稳固根基、成熟发展。品牌建立、文化传承、确立制度。' },
    { index:51, symbol:'䷲', name:'震',   pinyin:'zhèn',     upper:'震', lower:'震',
      guaci:'亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。',
      tuan:'震，亨。震来虩虩，恐致福也。笑言哑哑，后有则也。',
      xiang:'洊雷，震。君子以恐惧修省。',
      modern:'雷震、惊变。突发变故中保持镇定、不失分寸。危机应对、突发事件管理。' },
    { index:52, symbol:'䷳', name:'艮',   pinyin:'gèn',      upper:'艮', lower:'艮',
      guaci:'艮其背，不获其身。行其庭，不见其人。无咎。',
      tuan:'艮，止也。时止则止，时行则行，动静不失其时。',
      xiang:'兼山，艮。君子以思不出其位。',
      modern:'停止、静止。知止而后有定。该停就停，不越位思考。休息、止损、冥想。' },
    { index:53, symbol:'䷴', name:'渐',   pinyin:'jiàn',     upper:'巽', lower:'艮',
      guaci:'女归吉，利贞。',
      tuan:'渐之进也，女归吉也。进得位，往有功也。进以正，可以正邦也。',
      xiang:'山上有木，渐。君子以居贤德善俗。',
      modern:'渐进、循序渐进。不可急躁冒进。职业发展、感情培养、学习进步需按部就班。' },
    { index:54, symbol:'䷵', name:'归妹', pinyin:'guī mèi',  upper:'震', lower:'兑',
      guaci:'征凶，无攸利。',
      tuan:'归妹，天地之大义也。天地不交而万物不兴。归妹，人之终始也。',
      xiang:'泽上有雷，归妹。君子以永终知敝。',
      modern:'婚嫁、结合。名分不正或急于求成则有凶。感情婚姻需名正言顺、考虑长久。' },
    { index:55, symbol:'䷶', name:'丰',   pinyin:'fēng',     upper:'震', lower:'离',
      guaci:'亨。王假之，勿忧，宜日中。',
      tuan:'丰，大也。明以动，故丰。日中则昃，月盈则食，天地盈虚，与时消息。',
      xiang:'雷电皆至，丰。君子以折狱致刑。',
      modern:'丰盛、盛大。极盛时期但已暗藏衰退之机。盛极防衰、财富管理、权力制衡。' },
    { index:56, symbol:'䷷', name:'旅',   pinyin:'lǚ',       upper:'离', lower:'艮',
      guaci:'小亨。旅贞吉。',
      tuan:'旅，小亨。柔得中乎外而顺乎刚。旅之时义大矣哉。',
      xiang:'山上有火，旅。君子以明慎用刑而不留狱。',
      modern:'旅行、漂泊。在外宜谦逊谨慎。出差、移民、外出求学。不宜久居。' },
    { index:57, symbol:'䷸', name:'巽',   pinyin:'xùn',      upper:'巽', lower:'巽',
      guaci:'小亨。利有攸往，利见大人。',
      tuan:'重巽以申命。刚巽乎中正而志行，柔皆顺乎刚。',
      xiang:'随风，巽。君子以申命行事。',
      modern:'谦逊、渗透。如风之入，以柔克刚。沟通协调、市场推广、渐进改革。' },
    { index:58, symbol:'䷹', name:'兑',   pinyin:'duì',      upper:'兑', lower:'兑',
      guaci:'亨，利贞。',
      tuan:'兑，说也。刚中而柔外，说以利贞。顺乎天而应乎人。',
      xiang:'丽泽，兑。君子以朋友讲习。',
      modern:'喜悦、言说。以真诚喜悦待人。沟通交流、演讲表达、客户服务。' },
    { index:59, symbol:'䷺', name:'涣',   pinyin:'huàn',     upper:'巽', lower:'坎',
      guaci:'亨。王假有庙。利涉大川，利贞。',
      tuan:'涣，亨。刚来而不穷，柔得位乎外而上同。',
      xiang:'风行水上，涣。先王以享于帝立庙。',
      modern:'涣散、分散。散则聚之，需重新凝聚力量。团队重建、资源重分配、风控。' },
    { index:60, symbol:'䷻', name:'节',   pinyin:'jié',      upper:'坎', lower:'兑',
      guaci:'亨。苦节不可贞。',
      tuan:'节，亨。刚柔分而刚得中。天地节而四时成。节以制度，不伤财不害民。',
      xiang:'泽上有水，节。君子以制数度，议德行。',
      modern:'节制、节度。适度节制则亨通，过度苛刻则难守。预算管理、时间管理、自律。' },
    { index:61, symbol:'䷼', name:'中孚', pinyin:'zhōng fú', upper:'巽', lower:'兑',
      guaci:'豚鱼吉。利涉大川，利贞。',
      tuan:'中孚，柔在内而刚得中。说而巽，孚乃化邦也。',
      xiang:'泽上有风，中孚。君子以议狱缓死。',
      modern:'内心诚信。诚信感化万物，甚至豚鱼。诚信经营、品牌信誉、真诚待人。' },
    { index:62, symbol:'䷽', name:'小过', pinyin:'xiǎo guò', upper:'震', lower:'艮',
      guaci:'亨，利贞。可小事，不可大事。飞鸟遗之音，不宜上，宜下。',
      tuan:'小过，小者过而亨也。过以利贞，与时行也。',
      xiang:'山上有雷，小过。君子以行过乎恭，丧过乎哀，用过乎俭。',
      modern:'小有过失。宜低调、稳妥，不宜做大动作。谨慎行事、微调优化、保守策略。' },
    { index:63, symbol:'䷾', name:'既济', pinyin:'jì jì',    upper:'坎', lower:'离',
      guaci:'亨小，利贞。初吉终乱。',
      tuan:'既济，亨小者，亨也。利贞，刚柔正而位当也。终止则乱，其道穷也。',
      xiang:'水在火上，既济。君子以思患而豫防之。',
      modern:'已经成功、万事已济。创业成功但已见衰象。思患预防、居安思危。事情完成后的维护。' },
    { index:64, symbol:'䷿', name:'未济', pinyin:'wèi jì',   upper:'离', lower:'坎',
      guaci:'亨。小狐汔济，濡其尾，无攸利。',
      tuan:'未济，亨。柔得中也。小狐汔济，未出中也。濡其尾，无攸利，不续终也。',
      xiang:'火在水上，未济。君子以慎辨物居方。',
      modern:'尚未成功、事未成。虽未完成但充满希望。保持谨慎、继续努力。新的开始、未完待续。' }
  ];

  // 索引映射：symbol→hexagram, name→hexagram
  var HEX_BY_SYMBOL = {}, HEX_BY_NAME = {}, HEX_BY_PINYIN = {};
  HEXAGRAMS.forEach(function(h){
    HEX_BY_SYMBOL[h.symbol] = h;
    HEX_BY_NAME[h.name] = h;
    // 拼音可能含空格
    var pyParts = h.pinyin.split(/\s+/);
    pyParts.forEach(function(p){ HEX_BY_PINYIN[p] = h; });
  });

  // ═══════════════════════════════════════════════════════
  // 卦符→六爻二进制 映射
  // 八卦三爻：乾111 兑110 离101 震100 巽011 坎010 艮001 坤000
  // 六十四卦六爻：上卦(上三爻) + 下卦(下三爻)
  // ═══════════════════════════════════════════════════════
  var TRIGRAM_BINARY = {
    '乾': 0b111, '兑': 0b110, '离': 0b101, '震': 0b100,
    '巽': 0b011, '坎': 0b010, '艮': 0b001, '坤': 0b000
  };

  // 二进制→八卦名（从下到上）
  function binaryToTrigramName(bin) {
    var map = { 0b111:'乾', 0b110:'兑', 0b101:'离', 0b100:'震',
                0b011:'巽', 0b010:'坎', 0b001:'艮', 0b000:'坤' };
    return map[bin] || null;
  }

  // 根据卦名获取三爻二进制
  function getTrigramBinary(name) { return TRIGRAM_BINARY[name]; }

  // ═══════════════════════════════════════════════════════
  // 核心函数
  // ═══════════════════════════════════════════════════════

  /**
   * 随机起卦：生成6爻，确定本卦+变卦+动爻
   * 使用传统"大衍之数"简化版：三变后得老阴(6)、少阳(7)、少阴(8)、老阳(9)
   * 返回 { original: hexagramObj, changing: hexagramObj, movingLines: [lineIndex,...], lines: [6或7或8或9,...] }
   */
  function cast() {
    var lines = [];
    for (var i = 0; i < 6; i++) {
      // 模拟三变得一爻：传统蓍草法概率分布
      // 老阳9(1/16) 少阴8(7/16) 少阳7(5/16) 老阴6(3/16)
      var r = Math.random();
      if (r < 1/16)      lines.push(9);   // 老阳 — —○ 变阴
      else if (r < 8/16) lines.push(8);   // 少阴 — —
      else if (r < 13/16)lines.push(7);   // 少阳 ———
      else                lines.push(6);   // 老阴 — —× 变阳
    }

    // 本卦：从下到上（lines[0]=初爻, lines[5]=上爻）
    var originalSymbol = linesToHexagramSymbol(lines);
    var original = HEX_BY_SYMBOL[originalSymbol] || null;

    // 变卦：动爻（6→7, 9→8）
    var changingLines = lines.slice();
    var movingLines = [];
    for (var j = 0; j < 6; j++) {
      if (changingLines[j] === 6) { changingLines[j] = 7; movingLines.push(j); }
      else if (changingLines[j] === 9) { changingLines[j] = 8; movingLines.push(j); }
    }
    var changingSymbol = linesToHexagramSymbol(changingLines);
    var changing = HEX_BY_SYMBOL[changingSymbol] || null;

    return {
      original: original,
      changing: changing,
      movingLines: movingLines,
      lines: lines,
      changingLines: changingLines
    };
  }

  /**
   * 将6个数字（6/7/8/9，从初爻到上爻）转为六十四卦符
   */
  function linesToHexagramSymbol(lineValues) {
    if (lineValues.length !== 6) return null;
    // 下卦（初、二、三爻）
    var lowerBits = 0;
    for (var i = 0; i < 3; i++) {
      var val = lineValues[i];
      // 6(老阴)或8(少阴) → 0(阴爻); 7(少阳)或9(老阳) → 1(阳爻)
      var bit = (val === 7 || val === 9) ? 1 : 0;
      lowerBits = (lowerBits << 1) | bit;
    }
    // 上卦（四、五、上爻）
    var upperBits = 0;
    for (var i2 = 3; i2 < 6; i2++) {
      var val2 = lineValues[i2];
      var bit2 = (val2 === 7 || val2 === 9) ? 1 : 0;
      upperBits = (upperBits << 1) | bit2;
    }
    var upperName = binaryToTrigramName(upperBits);
    var lowerName = binaryToTrigramName(lowerBits);
    // 查找卦符
    for (var k = 0; k < HEXAGRAMS.length; k++) {
      if (HEXAGRAMS[k].upper === upperName && HEXAGRAMS[k].lower === lowerName) {
        return HEXAGRAMS[k].symbol;
      }
    }
    return null;
  }

  /**
   * 渲染单卦为HTML（包含上下卦）
   */
  function renderHexagram(hexagram) {
    if (!hexagram) return '<div class="yijing-empty">无卦象</div>';
    var upperGua = BAGUA_MAP[hexagram.upper];
    var lowerGua = BAGUA_MAP[hexagram.lower];
    var upperSym = upperGua ? upperGua.symbol : '';
    var lowerSym = lowerGua ? lowerGua.symbol : '';
    return '<div class="yijing-hexagram">' +
      '<div class="yijing-hex-symbol">' + hexagram.symbol + '</div>' +
      '<div class="yijing-hex-name">' + hexagram.name + ' <span class="yijing-pinyin">(' + hexagram.pinyin + ')</span></div>' +
      '<div class="yijing-hex-trigrams">' + upperSym + ' ' + (hexagram.upper||'') + ' · ' + (hexagram.lower||'') + ' ' + lowerSym + '</div>' +
      '</div>';
  }

  /**
   * 渲染完整起卦结果为HTML
   */
  function renderCasting(result) {
    if (!result || !result.original) return '<div class="yijing-empty">起卦失败，请重试</div>';

    var orig = result.original;
    var change = result.changing;
    var moving = result.movingLines || [];

    // 爻位名称
    var lineNames = ['初爻','二爻','三爻','四爻','五爻','上爻'];
    var movingDesc = moving.length > 0
      ? moving.map(function(li){ return lineNames[li]; }).join('、')
      : '无动爻（静卦）';

    // 爻象HTML
    var linesHtml = '';
    var values = result.lines || [];
    for (var i = values.length - 1; i >= 0; i--) {
      var v = values[i];
      var isMoving = moving.indexOf(i) !== -1;
      var isYang = (v === 7 || v === 9);
      var lineClass = isYang ? 'yijing-line-yang' : 'yijing-line-yin';
      if (isMoving) lineClass += ' yijing-line-moving';
      var label = lineNames[i];
      var typeLabel = '';
      if (v === 9) typeLabel = '老阳⚊○';
      else if (v === 8) typeLabel = '少阴⚋';
      else if (v === 7) typeLabel = '少阳⚊';
      else if (v === 6) typeLabel = '老阴⚋×';
      linesHtml += '<div class="' + lineClass + '"><span class="yijing-line-label">' + label + '</span><span class="yijing-line-bar">' + (isYang ? '━━━━━' : '━━ ━━') + '</span><span class="yijing-line-type">' + typeLabel + '</span></div>';
    }

    var changeHtml = '';
    if (change && moving.length > 0) {
      changeHtml = '<div class="yijing-change-block">' +
        '<div class="yijing-change-label">变卦</div>' +
        renderHexagram(change) +
        '<div class="yijing-change-guaci"><strong>卦辞：</strong>' + change.guaci + '</div>' +
        '<div class="yijing-change-xiang"><strong>象曰：</strong>' + change.xiang + '</div>' +
        '</div>';
    }

    return '<div class="yijing-casting">' +
      '<div class="yijing-casting-header">起卦结果</div>' +
      '<div class="yijing-lines">' + linesHtml + '</div>' +
      '<div class="yijing-original-block">' +
      '<div class="yijing-change-label">本卦</div>' +
      renderHexagram(orig) +
      '<div class="yijing-change-guaci"><strong>卦辞：</strong>' + orig.guaci + '</div>' +
      '<div class="yijing-change-xiang"><strong>象曰：</strong>' + orig.xiang + '</div>' +
      '<div class="yijing-change-tuan"><strong>彖曰：</strong>' + orig.tuan + '</div>' +
      '<div class="yijing-modern"><strong>现代应用：</strong>' + orig.modern + '</div>' +
      '</div>' +
      '<div class="yijing-moving-info"><strong>动爻：</strong>' + (moving.length > 0 ? movingDesc : '无动爻（静卦）') + '</div>' +
      changeHtml +
      '</div>';
  }

  /**
   * 搜索卦：按卦名或拼音搜索
   */
  function searchHexagrams(query) {
    if (!query || query.trim() === '') return HEXAGRAMS.slice();
    var q = query.trim().toLowerCase();
    // 去掉拼音中的变音符号以便搜索
    var qPlain = q.normalize ? q.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : q;
    var results = [];
    HEXAGRAMS.forEach(function(h){
      var nameLower = h.name.toLowerCase();
      var pyLower = h.pinyin.toLowerCase();
      var pyPlain = pyLower.normalize ? pyLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : pyLower;
      if (nameLower.indexOf(q) !== -1 ||
          pyLower.indexOf(q) !== -1 ||
          pyPlain.indexOf(qPlain) !== -1) {
        results.push(h);
      }
    });
    return results;
  }

  /**
   * 获取全部64卦
   */
  function getAll() { return HEXAGRAMS.slice(); }

  /**
   * 按序号获取卦
   */
  function getByIndex(idx) {
    return HEXAGRAMS[idx - 1] || null;
  }

  /**
   * 按名称获取卦
   */
  function getByName(name) {
    return HEX_BY_NAME[name] || null;
  }

  // ═══════════════════════════════════════════════════════
  // 导出到 window.YIJING
  // ═══════════════════════════════════════════════════════
  window.YIJING = {
    // 数据
    BAGUA: BAGUA,
    BAGUA_LIST: BAGUA_LIST,
    HEXAGRAMS: HEXAGRAMS,

    // 核心函数
    cast: cast,
    renderHexagram: renderHexagram,
    renderCasting: renderCasting,
    searchHexagrams: searchHexagrams,
    getAll: getAll,
    getByIndex: getByIndex,
    getByName: getByName,

    // 内部工具（暴露供调试）
    linesToHexagramSymbol: linesToHexagramSymbol
  };

})();
