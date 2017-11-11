function init() {
    // if no anchor # after page name, then open home tab.
    openTab("home");
    getArticles();
    onhashchange = viewArticle;
    var page = window.location.hash.replace("#", "");
    if (Object.keys(articles).indexOf(page) === -1) {
        openTab(page);
        viewArticle();
    }
}

function openTab(pageName) {
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
    window.location.hash = pageName;
    $("#full-article").hide();
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
    $.each(data, function (key, val) {
        articleTags[key] = val;
        articleSort.push(key);
        // Store unique tags
        $.each(val, function (index, tag) {
            if (uniqueTags.indexOf(tag) === -1 && index > 0) {
                uniqueTags.push(tag);
            }
        });
    });
    downloadArticleBodies();
}

function downloadArticleBodies() {
    var promises = [];
    $.each(articleTags, function (key) {
        promises.push(
            $.ajax({
                mimeType: 'text/plain; charset=x-user-defined',
                url: "./articles/" + key + ".md",
                type: "GET",
                dataType: "text",
                cache: false,
                success: function (data) {
                    articles[key] = String(data);
                    Promise.resolve();
                }
            }));
    });
    // Use futures, after all the above ajax finished then make grid.
    Promise.all(promises).then(createGrid);
}

function createGrid() {
    sortArticlesByLatestDate();
    // Add a grid item with article's image and first 2 paragraphs. Markdown formatted.
    var converter = new showdown.Converter();
    $.each(articleSort, function (index, value) {
        var title = String(value).replace("_", " "),
            // Display the image and the first paragraph.(double newline)
            shortBlurb = articles[value].split('\n\n'),
            content = String(shortBlurb[1] + "<br>" + shortBlurb[2]);
        $(".grid")[0].innerHTML += "<div id='" + value + "' class='grid-item' onclick='clickedArticle(this.id)'><img src='./articles/" + value + ".jpg'><article><h3>" + title + "</h3><br>" + converter.makeHtml(content) + "</article>";
    });
    $.each(uniqueTags, function (index, value) {
        //Create buttons for tags.
        $(".tags")[0].innerHTML += "<li><button class='button-tag' id='" + value + "-tag' onclick='tagButton(this.id)'>" + value + "</button></li>";

    });
}

function sortArticlesByLatestDate() {
    articleSort.sort(function (a, b) {
        return new Date(articleTags[a][0]) + new Date(articleTags[b][0]);
    });
}

function tagButton(keyword) {
    //var searchQuery = String(encodeURI($("#searcher").val()));
    highlightTagButton(keyword);
    if (keyword.trim() === "") {
        $.each(articleSort, function (index, value) {
            $("#" + value).fadeIn("slow");
        });
        return;
    }
    var tag = keyword.replace("-tag", "");
    var fadeSpeedMs = 200;
    $.each(articleTags, function (key, value) {
        if (value.indexOf(tag) >= 0) {
            $("#" + key).fadeIn(fadeSpeedMs);
        } else if (value.indexOf(tag) === -1) {
            $("#" + key).fadeOut(fadeSpeedMs);
        }
    });
}

function highlightTagButton(tag) {
    var i = 0;
    for (i; i < uniqueTags.length; i++) {
        var bgcolour = "white",
            colour = "black",
            btn_id = String(uniqueTags[i]) + "-tag",
            btn = document.getElementById(btn_id);
        if (tag === btn_id) {
            bgcolour = "black";
            colour = "white";
        }
        btn.style.backgroundColor = bgcolour;
        btn.style.color = colour;
    }
}

function clickedArticle(article) {
    window.location.hash = String(article);
}

function hideFullArticle(toOpen = "") {
    $("#" + toOpen).show();
    $("#full-article").hide();
    window.location.hash = toOpen;
    openTab(toOpen);
}

function viewArticle() {
    var articleHash = window.location.hash.replace("#", "");
    // If the article title is empty or not found just go home.
    if (articleHash === "" || Object.keys(articles).indexOf(articleHash) === -1) {
        hideFullArticle(articleHash);
        return;
    }
    $("#home").hide();
    $("#full-article").show();
    var converter = new showdown.Converter();
    var htmlFromMarkdown = "<div id=" + articleHash + ">" + converter.makeHtml(articles[articleHash]) + "</div>";
    $("#article-content").html(htmlFromMarkdown);
    // jQUery scroll to element taken from Steve https://stackoverflow.com/a/6677069
    $("html, body").animate({
        scrollTop: $("#" + articleHash).offset().top
    }, 200);
}
