// Seed data: 30 launch initiatives for the Product Commercialization portfolio.
// Row shape: [id, name, platform, segment, status, fy, rev_type, owner,
//             fy26_target, fy27_target, pepm, progress_metric, notes,
//             target_launch, forecast_launch, target_progress, actual_progress, ramp_pct]
export const SEED_INITIATIVES = [
  [1,"I-9 Pricing Modernization","Flex","SMB HCM","In Progress","FY26","Transactional","",3840000,4032000,0,"enablement","$99 new / $85 existing","2026-01","2026-01",100,72,72],
  [2,"Premium Processing Fee – Cutoff Logic","Flex","SMB HCM","In Progress","FY26","Transactional","",3700000,14800000,0,"enablement","New 5pm cutoff; ~438K payrolls","2026-03","2026-03",100,45,45],
  [3,"WFM Bundling & Pricing Simplification","Flex","SMB HCM","In Progress","FY26","PEPM","Eric Vicknair",83500,5000000,0.84,"attach","Rationalize Flex WFM bundles","2025-12","2026-02",15,8,30],
  [4,"Billing 1099s for HR Pro","Flex","SMB HCM","Completed","FY26","Fee Increase","",1750000,4100000,0,"enablement","Net new HR Pro at full PEPM","2025-10","2025-10",100,100,100],
  [5,"HR Pro MMB Increase","Flex","SMB HCM","Completed","FY26","Fee Increase","",1100000,1900000,0,"enablement","Monthly minimum billing increase","2025-10","2025-10",100,100,100],
  [6,"HR Pro in Oracle/MM Bundles Pilot","Flex","HR Solutions","In Progress","FY26","PEPM","",200000,5400000,0,"attach","Back-to-base Oracle HR Pro + increased attach","2026-01","2026-03",20,6,18],
  [7,"TCS / WOTC Integration","Flex","SMB HCM","In Progress","FY26","Transactional","",800000,1200000,0,"enablement","Digitize WOTC agreement/onboarding","2026-01","2026-02",100,55,55],
  [8,"Classic Hiring Price Increase","Flex","SMB HCM","Consideration","FY26","PEPM + Fee","",565000,425000,0.15,"enablement","Per-user and per-check fee increases Q4","2026-05","",0,0,0],
  [9,"Flex Hiring Price Increase","Flex","SMB HCM","Consideration","FY26","PEPM + Fee","",1000000,4001000,2,"enablement","$2 PEPM + setup fee changes","2026-05","",0,0,0],
  [10,"WFM Bundle – AI Scheduling + Labor Forecasting","Paycor","Upmarket HCM","Completed","FY26","PEPM","Eric Vicknair",8000000,8000000,2,"attach","Re-tiers WFM Pro; Q4 FY25","2025-10","2025-10",60,60,100],
  [11,"Talent Management Pro – LMS Compliance","Paycor","Upmarket HCM","Completed","FY26","PEPM","",325000,780000,1,"enablement","Compliance course library in Pro bundle","2025-11","2025-11",100,100,100],
  [12,"Project SAD – Activation Billing","Paycor","Enterprise","Completed","FY26","Fee Increase","",1000000,4000000,0,"enablement","Billing activation for Talent/Pulse/Comp Mgt","2025-09","2025-09",100,100,100],
  [13,"Paycor Perks (Marketplace)","Paycor","Upmarket HCM","In Progress","FY26","Transactional","",250000,1730000,0,"enablement","Jan 2026 FY27 revenue updated","2026-03","2026-04",100,35,35],
  [14,"I-9 Equifax Compliance","Paycor","Upmarket HCM","In Progress","FY26","Transactional","",0,1700000,0,"enablement","Q4 FY26 launch","2026-05","2026-06",100,10,10],
  [15,"Paychex Perks","Both","Marketplace","Completed","FY26","Transactional","Eric Vicknair",18200000,10200000,0,"enablement","190K employees purchased","2025-09","2025-09",100,100,100],
  [16,"Recruiting Co-Pilot","Both","HCM","In Progress","FY26","Transactional","",2400000,0,0,"enablement","350 paid subscribers at launch","2025-09","2025-09",100,60,60],
  [17,"Enterprise Tech Bundle (Basic)","Paycor","Enterprise","In Progress","FY27","PEPM","Eric Vicknair",0,8400000,4,"attach","Unlimited std integrations + IAM; 90% attach target","2026-09","2026-11",90,0,0],
  [18,"Enterprise Tech Bundle – ERP Connector","Paycor","Enterprise","In Progress","FY27","Transactional","Eric Vicknair",0,1700000,2,"attach","25% attach; add-on to Tech Bundle","2026-09","2026-11",25,0,0],
  [19,"Enterprise Tech Bundle – Data Pipeline (Visier)","Paycor","Enterprise","In Progress","FY27","Transactional","Eric Vicknair",0,2000000,3,"attach","Exports HCM data to DW; 25% attach","2026-09","2026-11",25,0,0],
  [20,"Time-Off Management Completion","Flex","SMB HCM","In Progress","FY27","PEPM","Eric Vicknair",0,6000000,1.65,"attach","TOM as optional buy-up to HCM bundle","2026-09","2026-10",15,0,0],
  [21,"Flex HCM Bundle Redesign","Flex","SMB HCM","In Progress","FY27","Transactional","",245000,5000000,0,"enablement","Pilot April with ~20 reps","2026-04","2026-06",100,15,15],
  [22,"Ad-Hoc Comp Benchmarking","Flex","SMB HCM","In Progress","FY27","Transactional","Eric Vicknair",0,2000000,0,"enablement","~20K clients; 2-3 tx/year","2026-09","2026-09",100,0,0],
  [23,"PESS Background Check Integration","Flex","SMB HCM","Consideration","FY27","Transactional","Diego",0,2100000,36,"enablement","PESS widget in Onboarding","2026-11","",0,0,0],
  [24,"SixFifty in Paycor","Paycor","Enterprise","Completed","FY27","PEPM","",30000,1250000,2,"enablement","Fall 2026 price increase for ITB clients","2026-10","2026-10",100,100,100],
  [25,"ATS + Visier Analytics","Paycor","SMB HCM","In Progress","FY27","Transactional","Andie & Eric",0,1700000,0.5,"attach","40% attach; included in Basic Bundle","2026-09","2026-09",40,0,0],
  [26,"OurPeople Resell Partnership","Paycor","Enterprise","In Progress","FY27","PEPM","James & Andie",0,1300000,2,"enablement","Launch targeting Dec 2026","2026-12","2026-12",100,0,0],
  [27,"WISE Assistant – SF/Slack/MSFT Integrations","Both","Enterprise","Consideration","FY27","AI Monetization","James",0,0,0,"enablement","TBD revenue; high-impact AI companion integrations","","",0,0,0],
  [28,"WISE – Seat Licenses","Paycor","Enterprise","In Progress","FY27","AI Monetization","James",0,0,0,"enablement","In process; WISE AI monetization roadmap","","",0,0,0],
  [29,"My Perks & Paycor Perks Expansion","Both","Marketplace","Consideration","FY27","Transactional","",0,0,0,"enablement","TBD; expansion across platforms","","",0,0,0],
  [30,"Intelligent Pay Cycle (IPC)","Flex","SMB HCM","Consideration","FY27","TBD","",0,0,0,"enablement","TBD revenue; high-impact opportunity","","",0,0,0],
];

// Quarterly revenue realization for the initiatives with the most detail.
// Row shape: [initiative_id, period, target_rev, actual_rev]
export const SEED_ACTUALS = [
  // 1. I-9 Pricing Modernization
  [1,"FY26-Q3",1920000,1920000],
  [1,"FY26-Q4",1920000,844800],
  [1,"FY27-Q1",1008000,250000],
  [1,"FY27-Q2",1008000,0],
  [1,"FY27-Q3",1008000,0],
  [1,"FY27-Q4",1008000,0],

  // 2. Premium Processing Fee – Cutoff Logic
  [2,"FY26-Q4",3700000,1665000],
  [2,"FY27-Q1",3700000,500000],
  [2,"FY27-Q2",3700000,0],
  [2,"FY27-Q3",3700000,0],
  [2,"FY27-Q4",3700000,0],

  // 4. Billing 1099s for HR Pro
  [4,"FY26-Q2",875000,875000],
  [4,"FY26-Q3",437500,437500],
  [4,"FY26-Q4",437500,437500],
  [4,"FY27-Q1",1025000,1025000],
  [4,"FY27-Q2",1025000,0],
  [4,"FY27-Q3",1025000,0],
  [4,"FY27-Q4",1025000,0],

  // 5. HR Pro MMB Increase
  [5,"FY26-Q2",550000,550000],
  [5,"FY26-Q3",275000,275000],
  [5,"FY26-Q4",275000,275000],
  [5,"FY27-Q1",475000,475000],
  [5,"FY27-Q2",475000,0],
  [5,"FY27-Q3",475000,0],
  [5,"FY27-Q4",475000,0],

  // 10. WFM Bundle – AI Scheduling + Labor Forecasting
  [10,"FY26-Q2",4000000,4000000],
  [10,"FY26-Q3",2000000,2000000],
  [10,"FY26-Q4",2000000,2000000],
  [10,"FY27-Q1",2000000,2000000],
  [10,"FY27-Q2",2000000,0],
  [10,"FY27-Q3",2000000,0],
  [10,"FY27-Q4",2000000,0],

  // 15. Paychex Perks
  [15,"FY26-Q2",9100000,9100000],
  [15,"FY26-Q3",4550000,4550000],
  [15,"FY26-Q4",4550000,4550000],
  [15,"FY27-Q1",2550000,2550000],
  [15,"FY27-Q2",2550000,0],
  [15,"FY27-Q3",2550000,0],
  [15,"FY27-Q4",2550000,0],

  // 16. Recruiting Co-Pilot
  [16,"FY26-Q2",1200000,1200000],
  [16,"FY26-Q3",600000,180000],
  [16,"FY26-Q4",600000,60000],
];
