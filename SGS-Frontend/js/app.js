const navLinks = [
  ["Home","index.html","home"],
  ["About","about.html","about"],
  ["Team","team.html","team"],
  ["Results","results.html","results"],
  ["Contact","contact.html","contact"]
];

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
  initNavbar();
  initReveal();
  initTeam();
  initForms();
  initFilters();
});

function renderNavbar(){
  const mount=document.getElementById("navbar");
  if(!mount)return;
  const page=document.body.dataset.page || "";
  mount.innerHTML=`
    <header class="navbar" id="site-navbar">
      <a class="logo" href="index.html" aria-label="SGS home">
        <div class="logo-icon">SGS</div>
        <div class="logo-text">SPORTS GUILD<small>SOCIETY</small></div>
      </a>
      <nav class="nav-links">
        ${navLinks.map(([label,url,key])=>`<a class="${page===key?'active':''}" href="${url}">${label}</a>`).join("")}
      </nav>
      <a class="nav-cta" href="register.html">Register Now ↗</a>
      <button class="menu-btn" id="menu-btn" aria-label="Open menu"><span></span><span></span><span></span></button>
    </header>
    <nav class="mobile-nav" id="mobile-nav">
      ${navLinks.map(([label,url])=>`<a href="${url}">${label}</a>`).join("")}
      <a class="btn btn-primary" href="register.html">Register Now ↗</a>
    </nav>`;
}
function renderFooter(){
  const mount=document.getElementById("footer");
  if(!mount)return;
  mount.innerHTML=`<footer class="footer"><div class="footer-inner">
    <div><div class="logo"><div class="logo-icon">SGS</div><div class="logo-text">SPORTS GUILD<small>SOCIETY</small></div></div><div class="footer-copy" style="margin-top:12px">© 2026 Sports Guild Society. All rights reserved.</div></div>
    <div class="footer-links"><a href="about.html">About</a><a href="team.html">Team</a><a href="results.html">Hall of Fame</a><a href="contact.html">Contact</a><a href="login.html">Admin</a></div>
  </div></footer>`;
}
function initNavbar(){
  const nav=document.getElementById("site-navbar"), btn=document.getElementById("menu-btn"), mobile=document.getElementById("mobile-nav");
  window.addEventListener("scroll",()=>nav?.classList.toggle("scrolled",scrollY>20));
  btn?.addEventListener("click",()=>mobile.classList.toggle("open"));
  mobile?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobile.classList.remove("open")));
}
function initReveal(){
  const els=document.querySelectorAll(".reveal");
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
}
function initTeam(){
  document.querySelectorAll(".team-card").forEach(card=>card.addEventListener("click",()=>card.classList.toggle("open")));
}
function initFilters(){
  const buttons=document.querySelectorAll(".filter-btn"), cards=document.querySelectorAll(".team-card");
  if(!buttons.length)return;
  buttons.forEach(btn=>btn.addEventListener("click",()=>{
    buttons.forEach(b=>b.classList.remove("active"));btn.classList.add("active");
    const year=btn.dataset.year;
    cards.forEach(c=>c.style.display=year==="all"||c.dataset.year===year?"":"none");
  }));
}
function initForms(){
  document.querySelectorAll("form[data-demo]").forEach(form=>form.addEventListener("submit",e=>{
    e.preventDefault();
    const success=form.parentElement.querySelector(".success-box");
    if(success)success.style.display="block";
    showToast("Submitted successfully — this is a frontend demo.");
    form.reset();
  }));
}
function showToast(msg){
  let t=document.querySelector(".toast");
  if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}
  t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200);
}
