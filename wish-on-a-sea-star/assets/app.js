(function(){
  "use strict";

  var device = document.getElementById("device");
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  var NAV_SCREENS = ["map", "explore", "wish", "grantList", "profile"];
  var history_ = ["splash"];

  var wishes = {
    alex:  { name:"Alex's Wish", initial:"A", color:"#F66062", desc:"Wishes for a new laptop for college — starting my computer science degree this fall.",
             quote:"I'm starting my computer science degree and really need a laptop for my studies. Any help would mean the world to me!",
             raised:850, goal:1200, scale:"Medium" },
    mira:  { name:"Mira's Wish", initial:"M", color:"#00A88F", desc:"A week of groceries for me and my daughter while I'm between jobs.",
             quote:"It's been a tough month between jobs. A little help with groceries would mean so much for my daughter and me.",
             raised:32, goal:80, scale:"Small" },
    theo:  { name:"Theo's Wish", initial:"T", color:"#E89468", desc:"Tickets to the zoo with my little brother for his birthday this month.",
             quote:"My little brother has never been to the zoo. I want to make his birthday one he'll never forget.",
             raised:18, goal:30, scale:"Small" },
    priya: { name:"Priya's Wish", initial:"P", color:"#8765F2", desc:"Second-hand winter coat for my son — granted by 3 kind souls.",
             quote:"Winter is coming and my son has outgrown his coat. Any help finding a warm one would be wonderful.",
             raised:45, goal:45, scale:"Small", granted:true }
  };

  /* ---------------- screen routing ---------------- */
  function showScreen(name, opts){
    opts = opts || {};
    screens.forEach(function(s){ s.classList.toggle("active", s.dataset.screen === name); });

    var showNav = NAV_SCREENS.indexOf(name) !== -1;
    device.classList.toggle("hide-nav", !showNav);
    document.getElementById("bottomNav").style.display = showNav ? "flex" : "none";

    navItems.forEach(function(n){ n.classList.toggle("active", n.dataset.navkey === name); });

    if(opts.replace){
      history_[history_.length-1] = name;
    } else if(history_[history_.length-1] !== name){
      history_.push(name);
    }

    if(name === "wishCelebrate" || name === "grantCelebrate"){
      spawnConfetti(name === "wishCelebrate" ? "wishConfettiHost" : "grantConfettiHost");
    }
    closeSheet();
  }

  function goBack(){
    if(history_.length > 1){
      history_.pop();
      showScreen(history_[history_.length-1], {replace:true});
    } else {
      showScreen("map");
    }
  }

  document.addEventListener("click", function(e){
    var navEl = e.target.closest("[data-nav]");
    if(navEl){
      if(navEl.dataset.authTab){ presetAuthTab(navEl.dataset.authTab); }
      showScreen(navEl.dataset.nav);
      return;
    }
    var backEl = e.target.closest("[data-nav-back]");
    if(backEl){ goBack(); return; }
  });

  /* ---------------- toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 1700);
  }

  /* ---------------- confetti ---------------- */
  function spawnConfetti(hostId){
    var host = document.getElementById(hostId);
    if(!host) return;
    var colors = ["#F66062","#00D8B9","#E89468","#8765F2","#FFD166"];
    for(var i=0;i<26;i++){
      var c = document.createElement("div");
      c.className = "confetti";
      var size = 5 + Math.random()*6;
      c.style.width = size+"px";
      c.style.height = (size*0.4 + 4)+"px";
      c.style.left = (Math.random()*100)+"%";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (1.6 + Math.random()*1.2)+"s";
      c.style.animationDelay = (Math.random()*0.4)+"s";
      host.appendChild(c);
      (function(el){ setTimeout(function(){ el.remove(); }, 3200); })(c);
    }
  }

  /* ---------------- onboarding ---------------- */
  var onbSlides = Array.prototype.slice.call(document.querySelectorAll(".onb-slide"));
  var onbDots = Array.prototype.slice.call(document.querySelectorAll(".onb-dots span"));
  var onbIndex = 0;
  document.getElementById("onbNext").addEventListener("click", function(){
    if(onbIndex < onbSlides.length - 1){
      onbIndex++;
      onbSlides.forEach(function(s,i){ s.classList.toggle("active", i===onbIndex); });
      onbDots.forEach(function(d,i){ d.classList.toggle("active", i===onbIndex); });
      if(onbIndex === onbSlides.length - 1){ this.textContent = "Let's Go"; }
    } else {
      presetAuthTab("signup");
      showScreen("auth");
    }
  }.bind(document.getElementById("onbNext")));

  /* ---------------- auth ---------------- */
  var tabSignIn = document.getElementById("tabSignIn");
  var tabSignUp = document.getElementById("tabSignUp");
  var signInForm = document.getElementById("signInForm");
  var signUpForm = document.getElementById("signUpForm");
  function presetAuthTab(which){
    var signIn = which !== "signup";
    tabSignIn.classList.toggle("active", signIn);
    tabSignUp.classList.toggle("active", !signIn);
    signInForm.style.display = signIn ? "block" : "none";
    signUpForm.style.display = signIn ? "none" : "block";
  }
  tabSignIn.addEventListener("click", function(){ presetAuthTab("signin"); });
  tabSignUp.addEventListener("click", function(){ presetAuthTab("signup"); });

  /* ---------------- pill / category toggles (visual only) ---------------- */
  document.querySelectorAll(".pill-row").forEach(function(row){
    row.addEventListener("click", function(e){
      var pill = e.target.closest(".pill");
      if(!pill) return;
      row.querySelectorAll(".pill").forEach(function(p){ p.classList.remove("active"); });
      pill.classList.add("active");
      showToast("Showing: " + pill.textContent.trim());
    });
  });

  /* ---------------- bottom sheet (wish preview) ---------------- */
  var sheet = document.getElementById("wishSheet");
  var sheetBackdrop = document.getElementById("sheetBackdrop");
  var sheetBody = document.getElementById("sheetBody");
  var sheetWishId = null;

  function openSheet(id){
    var w = wishes[id];
    if(!w) return;
    sheetWishId = id;
    sheetBody.innerHTML =
      '<div style="display:flex;gap:12px;align-items:center;margin-bottom:14px;">' +
        '<div class="avatar" style="background:'+w.color+'">'+w.initial+'</div>' +
        '<div><h4 style="font-size:15px;font-weight:700;">'+w.name+'</h4>' +
        '<span class="tag '+w.scale.toLowerCase()+'">'+w.scale+'</span></div>' +
      '</div>' +
      '<p style="font-size:13.5px;color:var(--muted);line-height:1.55;margin-bottom:14px;">'+w.desc+'</p>' +
      '<div class="progress-row" style="margin-bottom:18px;">' +
        '<div class="progress-track"><div class="progress-fill" style="width:'+Math.min(100, Math.round(w.raised/w.goal*100))+'%"></div></div>' +
        '<div class="progress-nums"><span>$'+w.raised+' raised</span><span>Goal $'+w.goal+'</span></div>' +
      '</div>' +
      (w.granted ?
        '<button class="btn btn-outline" disabled>Already Granted 🎉</button>' :
        '<button class="btn btn-primary" id="sheetGrantBtn">View &amp; Grant This Wish</button>');
    sheet.classList.add("show");
    sheetBackdrop.classList.add("show");
    var btn = document.getElementById("sheetGrantBtn");
    if(btn){ btn.addEventListener("click", function(){ closeSheet(); openGrant(sheetWishId); }); }
  }
  function closeSheet(){
    sheet.classList.remove("show");
    sheetBackdrop.classList.remove("show");
  }
  sheetBackdrop.addEventListener("click", closeSheet);
  document.querySelector(".sheet-handle").addEventListener("click", closeSheet);

  document.addEventListener("click", function(e){
    var pin = e.target.closest(".map-pin");
    if(pin){ openSheet(pin.dataset.wish); return; }
    var card = e.target.closest(".wish-card[data-wish]");
    if(card && !card.closest(".sheet-body")){
      var w = wishes[card.dataset.wish];
      if(w && w.granted){ showToast(w.name + " has already been granted 🎉"); return; }
      openSheet(card.dataset.wish);
    }
  });

  /* ---------------- grant detail population ---------------- */
  function openGrant(id){
    var w = wishes[id];
    if(!w) return;
    document.getElementById("grantAvatar").style.background = w.color;
    document.getElementById("grantAvatar").textContent = w.initial;
    document.getElementById("grantName").textContent = w.name;
    document.getElementById("grantSub").textContent = w.desc;
    document.getElementById("grantQuote").textContent = '"' + w.quote + '"';
    document.getElementById("grantGoal").textContent = "$" + w.goal;
    document.getElementById("grantRaised").textContent = "$" + w.raised;
    document.getElementById("grantProgressFill").style.width = Math.min(100, Math.round(w.raised/w.goal*100)) + "%";
    currentGrantWish = id;
    resetAmountSelection();
    showScreen("grant");
  }
  var currentGrantWish = null;

  /* ---------------- grant amount / payment logic ---------------- */
  var amtChips = Array.prototype.slice.call(document.querySelectorAll(".amt-chip"));
  var customAmt = document.getElementById("customAmt");
  var amountHint = document.getElementById("amountHint");

  function resetAmountSelection(){
    amtChips.forEach(function(c){ c.classList.remove("active"); });
    amtChips[amtChips.length - 1].classList.add("active");
    customAmt.value = "";
    updateSummary(parseInt(amtChips[amtChips.length - 1].dataset.amt, 10));
  }

  function hintForAmount(amt){
    var w = wishes[currentGrantWish] || {goal:100, raised:0};
    var remaining = Math.max(w.goal - w.raised, 1);
    var pct = Math.round(Math.min(amt / remaining, 1) * 100);
    if(amt <= 25) return "$" + amt + " is a kind, easy way to help — every bit adds up. 💛";
    if(pct >= 90) return "$" + amt + " would fully fund the rest of this wish! ✨";
    return "$" + amt + " covers about " + pct + "% of what's left — a real step toward the goal.";
  }

  function updateSummary(amt){
    amt = Math.max(amt || 0, 0);
    var fee = Math.round(amt * 0.032 * 100) / 100;
    var total = Math.round((amt + fee) * 100) / 100;
    document.getElementById("sumDonation").textContent = "$" + amt.toFixed(2);
    document.getElementById("sumFee").textContent = "$" + fee.toFixed(2);
    document.getElementById("sumTotal").textContent = "$" + total.toFixed(2);
    amountHint.textContent = amt > 0 ? hintForAmount(amt) : "Choose an amount to see your impact.";
  }

  amtChips.forEach(function(chip){
    chip.addEventListener("click", function(){
      amtChips.forEach(function(c){ c.classList.remove("active"); });
      chip.classList.add("active");
      customAmt.value = "";
      updateSummary(parseInt(chip.dataset.amt, 10));
    });
  });
  customAmt.addEventListener("input", function(){
    amtChips.forEach(function(c){ c.classList.remove("active"); });
    updateSummary(parseFloat(customAmt.value) || 0);
  });

  var payOptions = Array.prototype.slice.call(document.querySelectorAll(".pay-option"));
  var cardFields = document.getElementById("cardFields");
  payOptions.forEach(function(opt){
    opt.addEventListener("click", function(){
      payOptions.forEach(function(o){ o.classList.remove("active"); });
      opt.classList.add("active");
      cardFields.style.display = opt.dataset.pay === "card" ? "block" : "none";
    });
  });

  document.getElementById("grantSubmit").addEventListener("click", function(){
    showScreen("grantCelebrate");
  });

  /* ---------------- wish wizard ---------------- */
  var wizPanels = Array.prototype.slice.call(document.querySelectorAll(".wiz-panel"));
  var wizDots = Array.prototype.slice.call(document.querySelectorAll("[data-step-dot]"));
  var wizStep = 0;
  var wizNextBtn = document.getElementById("wizNext");
  var wizPrevBtn = document.getElementById("wizPrev");
  var wizState = { photo:false, text:"", category:null, categoryLabel:null, scale:null, scaleLabel:null, loc:"neighborhood", locLabel:"My neighborhood" };

  function renderWiz(){
    wizPanels.forEach(function(p){ p.classList.toggle("active", parseInt(p.dataset.step,10) === wizStep); });
    wizDots.forEach(function(d){
      var i = parseInt(d.dataset.stepDot,10);
      d.classList.toggle("done", i < wizStep);
      d.classList.toggle("current", i === wizStep);
    });
    wizPrevBtn.style.display = wizStep === 0 ? "none" : "block";
    wizNextBtn.textContent = wizStep === wizPanels.length - 1 ? "Post My Wish ✨" : "Continue";
    if(wizStep === wizPanels.length - 1){
      document.getElementById("reviewText").textContent = wizState.text || "Describe your wish…";
      document.getElementById("reviewCat").textContent = wizState.categoryLabel || "—";
      document.getElementById("reviewLoc").textContent = wizState.locLabel;
      var tag = document.getElementById("reviewScaleTag");
      tag.textContent = wizState.scaleLabel || "Small";
      tag.className = "tag " + (wizState.scale || "small");
    }
  }
  function resetWiz(){
    wizStep = 0;
    wizState = { photo:false, text:"", category:null, categoryLabel:null, scale:null, scaleLabel:null, loc:"neighborhood", locLabel:"My neighborhood" };
    document.getElementById("photoDrop").classList.remove("filled");
    document.getElementById("photoDropText").textContent = "Tap to add photo";
    document.getElementById("wishText").value = "";
    document.getElementById("charCount").textContent = "0/220";
    document.querySelectorAll(".cat-card").forEach(function(c){ c.classList.remove("active"); });
    document.querySelectorAll(".scale-card").forEach(function(c){ c.classList.remove("active"); });
    document.getElementById("scaleHint").querySelector("span").textContent = "Pick a size to see how quickly wishes like it usually get granted.";
    document.querySelectorAll(".loc-option").forEach(function(o){ o.classList.toggle("active", o.dataset.loc === "neighborhood"); });
    renderWiz();
  }

  document.getElementById("photoDrop").addEventListener("click", function(){
    wizState.photo = !wizState.photo;
    this.classList.toggle("filled", wizState.photo);
    document.getElementById("photoDropText").textContent = wizState.photo ? "Photo added ✓" : "Tap to add photo";
  });

  var wishText = document.getElementById("wishText");
  wishText.addEventListener("input", function(){
    wizState.text = wishText.value;
    document.getElementById("charCount").textContent = wishText.value.length + "/220";
  });
  document.querySelectorAll(".chip-suggest").forEach(function(chip){
    chip.addEventListener("click", function(){
      wishText.value = chip.dataset.fill;
      wizState.text = chip.dataset.fill;
      document.getElementById("charCount").textContent = wishText.value.length + "/220";
    });
  });

  document.querySelectorAll(".cat-card").forEach(function(card){
    card.addEventListener("click", function(){
      document.querySelectorAll(".cat-card").forEach(function(c){ c.classList.remove("active"); });
      card.classList.add("active");
      wizState.category = card.dataset.catPick;
      wizState.categoryLabel = card.querySelector(".name").textContent;
    });
  });

  var scaleHintText = {
    small: "Small wishes are usually granted within 48 hours ⚡",
    medium: "Medium wishes take about a week on average — adding a photo helps a lot.",
    big: "Big dreams take longer to fund, but they inspire the most generosity 🌟"
  };
  document.querySelectorAll(".scale-card").forEach(function(card){
    card.addEventListener("click", function(){
      document.querySelectorAll(".scale-card").forEach(function(c){ c.classList.remove("active"); });
      card.classList.add("active");
      wizState.scale = card.dataset.scale;
      wizState.scaleLabel = card.querySelector(".lbl").textContent;
      document.getElementById("scaleHint").querySelector("span").textContent = scaleHintText[card.dataset.scale];
    });
  });

  document.querySelectorAll(".loc-option").forEach(function(opt){
    opt.addEventListener("click", function(){
      document.querySelectorAll(".loc-option").forEach(function(o){ o.classList.remove("active"); });
      opt.classList.add("active");
      wizState.loc = opt.dataset.loc;
      wizState.locLabel = opt.querySelector(".lo-title").childNodes[0].textContent.trim();
    });
  });

  wizNextBtn.addEventListener("click", function(){
    if(wizStep === 1 && !wizState.text.trim()){
      showToast("Tell us a little about your wish first 💬");
      wishText.focus();
      return;
    }
    if(wizStep === 2 && !wizState.category){
      showToast("Pick a category that fits best");
      return;
    }
    if(wizStep === 3 && !wizState.scale){
      showToast("Choose a size for your wish");
      return;
    }
    if(wizStep === wizPanels.length - 1){
      showScreen("wishCelebrate");
      resetWiz();
      return;
    }
    wizStep++;
    renderWiz();
  });
  wizPrevBtn.addEventListener("click", function(){
    if(wizStep > 0){ wizStep--; renderWiz(); }
  });
  document.getElementById("wizBack").addEventListener("click", function(){
    resetWiz();
    goBack();
  });

  /* ---------------- profile tabs ---------------- */
  document.querySelectorAll(".tab-item").forEach(function(tab){
    tab.addEventListener("click", function(){
      document.querySelectorAll(".tab-item").forEach(function(t){ t.classList.remove("active"); });
      tab.classList.add("active");
      document.querySelectorAll(".ptab-panel").forEach(function(p){
        p.style.display = (p.dataset.ppanel === tab.dataset.ptab) ? "block" : "none";
      });
    });
  });

  /* ---------------- init ---------------- */
  renderWiz();
  showScreen("splash", {replace:true});
})();
