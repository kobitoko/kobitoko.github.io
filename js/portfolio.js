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
    getArticles();
}

function getArticles() {
    $.getJSON("articles.json", {}, crawlArticles);
}

var articleTags = {}, 
    articles = {},
    articleSort = [];

function crawlArticles(data) {
    $.each(data, function(key, val) {
        articleTags[key] = val;
        articleSort.push(key);
    });
    downloadArticles();
}

function downloadArticles() {
    var promises = [];
    $.each(articleTags, function(key) {
        promises.push(
        $.ajax({
            mimeType: 'text/plain; charset=x-user-defined',
            url: "./articles/"+key+".md",
            type: "GET",
            dataType: "text",
            cache: false,
            success: function(data) {
                articles[key] = String(data);
                Promise.resolve();
            }
        }));
    });
    // Use futures, after all the above ajax finished then make grid.
    Promise.all(promises).then(createGrid);
}

function sortByDate () {
    articleSort.sort(function(a, b) {
       return new Date(articleTags[a][0]) + new Date(articleTags[b][0]);
    });
}

var $grid = null;

function createGrid() {
    sortByDate();
    var converter = new showdown.Converter();
    $.each(articleSort, function(index, value) {
        var title = String(value).replace("_"," "),
        // Display the image and the first paragraph.(double newline)
        shortBlurb = articles[value].split('\n\n'),
        content = String(shortBlurb[1]+"<br>"+shortBlurb[2]);
        var tags = articleTags[value].join(" ");
        $(".grid")[0].innerHTML += "<div class='grid-item "+String(tags)+"'><img src='./articles/"+value+".jpg'><article><h3>"+title+"</h3><br>"+ converter.makeHtml(content) +"</article>";
        // assign grid to Isotope after it loaded all the items.
    });
    $grid = $('.grid').isotope({
            itemSelector: '.grid-item',
            layoutMode: 'fitRows'
    });
}

    $("#searcher").on("input", function () {
        // TEST search:
        var searchQuery = { filter:String(encodeURI($("#searcher").val()))};
        console.log("changed to: "+JSON.stringify(searchQuery));
        $grid.isotope(searchQuery);
    });

