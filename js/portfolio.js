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
    $.getJSON("articles.json", {}, storeArticles);
}

// Title key and date+tags as an array of tags
var articleTags = {},
    // The actual contents of articles, with title as key
    articles = {},
    // Array of articles to be sorted by their date tag
    articleSort = [],
    // Array of unique tags shared by all articles
    uniqueTags = [];

function storeArticles(data) {
    // Store article title and it's tags
    $.each(data, function(key, val) {
        articleTags[key] = val;
        articleSort.push(key);
        // Store unique tags
        $.each(val, function(index, tag) {
            if(uniqueTags.indexOf(tag) === -1) {
                uniqueTags.push(tag);
            }
        });
    });
    downloadArticleBodies();
}

function downloadArticleBodies() {
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

function sortArticlesByLatestDate () {
    articleSort.sort(function(a, b) {
       return new Date(articleTags[a][0]) + new Date(articleTags[b][0]);
    });
}

var $grid = null;

function createGrid() {
    sortArticlesByLatestDate();
    // Add a grid item with article's image and first 2 paragraphs. Markdown formatted.
    var converter = new showdown.Converter();
    $.each(articleSort, function(index, value) {
        var title = String(value).replace("_"," "),
        // Display the image and the first paragraph.(double newline)
        shortBlurb = articles[value].split('\n\n'),
        content = String(shortBlurb[1]+"<br>"+shortBlurb[2]);
        // Tags for Isotope
        var tags = articleTags[value].join(" ");
        $(".grid")[0].innerHTML += "<div class='grid-item "+String(tags)+"'><img src='./articles/"+value+".jpg'><article><h3>"+title+"</h3><br>"+ converter.makeHtml(content) +"</article>";
    });
    // Add tag buttons for Isotope
    $.each(uniqueTags, function(index, value) {
        //Create buttons for tags.
        // Use alternative to isotope?
        // http://yiotis.net/filterizr/
        // or with scaling disabled: https://github.com/razorjack/quicksand/
    });
    // Assign grid to Isotope after it put all the items in the html
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

