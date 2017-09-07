function openTab(pageName) {
    // TODO: add a # at the end of the url so one can copy paste the tab?
    //       or make it so tabs are different from content.?
    //       or make it so every # is different from tabs and individual items.
    //       so that a window is open when its e.g. a portfolio #
    var pages = document.getElementsByClassName("page"),
        i = 0;
    for (i; i < pages.length; i++) {
        var colour = "white",
            btn_id = String(pages[i].id) + "-btn",
            btn = document.getElementById(btn_id);
        if (pages[i].id === pageName) {
            pages[i].style.display = "block";
            colour = "green";
        } else {
            pages[i].style.display = "none";
        }
        btn.style.color = colour;
    }
}

function init() {
    // if no anchor # after page name, then open home tab.
    openTab("home");
}
