// ==UserScript==
// @name        C&C Tiberium Alliances Multi Session
// @namespace   tiberiumalliances.com
// @include     http://*tiberiumalliances.com/*
// @include     https://*tiberiumalliances.com/*
// @icon        https://cncapp05.alliances.commandandconquer.com/339/favicon.ico
// @version     0.6.1
// @description Open Multi C&C Tiberium Alliances Session at one Browser
// @author	Elda1990 & DLwarez & Version 0.6.1 for Chrome adapted by Ghostleader1402
// ==/UserScript==


if (window.jQuery) {

    $('.p4fnav-block').prepend('<div style="display:block;float:left;cursor:pointer;"><div class="p4fnav-topnav-separator"></div><span name="new_session" class="p4fnav-url">New Session</span><div class="p4fnav-topnav-separator"></div>');
    $('.returned-user').append(' - <b><span name="new_session" class="change-server" style="cursor:pointer;">New Session</span></b>');

    $('[name="new_session"]').live("click", function () {
        cncms_new_session();
    });

}



function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}


function cncms_new_session() {
    eraseCookie("JSESSIONID");
    eraseCookie("Rememberme");
    eraseCookie("commandandconquer_remember_me");
    eraseCookie("commandandconquer_remember_me_success");
    window.location.reload();
}