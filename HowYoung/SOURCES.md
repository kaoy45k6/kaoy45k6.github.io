# 資料與素材來源

資料取得日期：2026-11-03。取得日期不是每筆地圖物件的最後更新日期。

## 地理資料

© OpenStreetMap contributors
https://www.openstreetmap.org/copyright

地圖資料依 Open Database License (ODbL) 1.0 提供：
https://opendatacommons.org/licenses/odbl/1-0/

本檔案包中的 `data/map.js` 與 `data/places.json` 是 OSM 衍生地理資料，依 ODbL 1.0 提供；保留來源標示及相同授權義務。網站程式與委託人提供的品牌圖片不因此轉為 ODbL。

由公開 OSM API 取得六個範圍的節點、道路、建築與關聯資料：
- https://www.openstreetmap.org/api/0.6/map?bbox=120.294,22.672,120.3065,22.683
- https://www.openstreetmap.org/api/0.6/map?bbox=120.3065,22.672,120.319,22.683
- https://www.openstreetmap.org/api/0.6/map?bbox=120.294,22.683,120.3065,22.694
- https://www.openstreetmap.org/api/0.6/map?bbox=120.3065,22.683,120.319,22.694
- https://www.openstreetmap.org/api/0.6/map?bbox=120.294,22.662,120.3065,22.672
- https://www.openstreetmap.org/api/0.6/map?bbox=120.3065,22.662,120.319,22.672
- 蓮池潭完整水域關聯：https://www.openstreetmap.org/api/0.6/relation/2999045/full

所有已收錄 POI 的原始節點／道路／關聯連結見 data/places.json 的 source 欄位。
無名稱、無可用座標、範圍外及不屬於本案分類的物件未納入 POI。近距離、同名、跨物件類型的疑似重複標記有限度合併。OSM 並非完整商家資料庫，也不是營業狀態查證服務。

地圖以基地為原點採局部平面近似：經度每度約 102720 公尺、緯度每度約 111320 公尺。顯示直線距離是此近似平面計算結果，不代表道路距離、步行時間或導航路線。連接基地與選定地點的虛線也是方位參考，不是路線。

## 特定介紹參考

1. 高雄捷運：生態園區站，官方站碼「R15」
https://www.krtc.com.tw/Guide/station_info?n=R15

2. 高雄旅遊網：洲仔濕地公園
https://khh.travel/zh-tw/attractions/detail/43/
原文摘錄：「入園採線上預約解說制」

3. 高雄市政府：洲仔濕地景觀改造啟動，預計116年春季完工
https://www.kcg.gov.tw/CityNews_Detail1.aspx?n=3A379BB94CA5F12D&ss=1388BED3A220A71E
網站未保證目前可自由入園，提醒依管理單位公告。

4. 高雄市楠梓地政事務所：地區特色
https://ntlao.kcg.gov.tw/CP/3610/
原生植物園介紹摘錄：「以原生植物為主題的公園」

5. 基地地址交叉核對：591 得邑建設政德路案
https://newhouse.591.com.tw/142407/detail
網站的基地座標仍以委託人提供座標為準，不是地籍界址；未擷取坪數、價格或未確認的銷售資訊。

## 圖像

品牌標準字、少年圖形：委託人提供「得邑少年行－品牌標準字-1.ai」，擷取成透明 PNG，未使用替代字型重製商標。
建築圖片：委託人提供 S__57868417.jpg，轉成 WebP。
本版主要導覽站點使用實景照片；未確認照片的地點提供外部照片查詢入口。
全站無外部圖片熱連結、外部字型、追蹤器或地圖 API 金鑰。

## 藍白動態導覽更新（2026-11-04）
- 向南延伸至 22.662，包含巨蛋生活圈。
- 高雄捷運紅線路線幾何：https://www.openstreetmap.org/relation/4174828
- 捷運站資料：https://www.krtc.com.tw/Guide/station_info?n=R15 （其餘站點以對應站碼連結）
- 高鐵：OSM railway=rail 且 highspeed=yes 的軌道，與一般台鐵區隔。
- 自由黃昏市場採 OSM way/311249717，非市場旁 YouBike 站。
- 自由黃昏市場地址佐證：https://takao.kcg.gov.tw/article/1198 ，文中「地點：高雄市左營區自由三路261號」。
- 照片來源逐筆列於 data/photo-sources.json。8 張照片為外部網路實景；不宣稱已取得商業再利用權。
- 此版插畫：使用者提供「20261003_改馬卡龍色.png」，完整置入首頁。
- 導覽折線表示瀏覽順序，非步行或行車導航；列車為動畫，不提供實際班次或即時位置。

## V3 補圖與版面更新
新增 3 張相符分店照片：美濃客家菜大中店（華夏路1062號）、石二鍋高雄華夏店、自由羊肉火鍋華夏店（華夏路1147號）。逐筆來源見 data/photo-sources.json。照片拍攝年份不同，不保證代表最新招牌或營業狀態。
美濃客家菜門市地址查核：https://page.line.me/zyy2918y ，原文「地址：高雄市左營區華夏路1062號」。
自由羊肉照片所屬分店依原網站圖片替代文字「自由羊肉火鍋華夏店」對應，未使用同文的自由店照片。
首次首頁插畫已移除，改用委託人品牌 Logo；建築外觀照片沿用委託人提供資料。


2026-11-04 版面修訂：新增50嵐自由曾子店照片；來源與原圖詳見data/photo-sources.json。網頁新增sources.html可直接檢視來源。

V10 市場照片：高雄畫刊〈達人帶你逛！自由黃昏市場採買燃起主婦魂〉，攝影／李瑰嫻。https://takao.kcg.gov.tw/article/1198
