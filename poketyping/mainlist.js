$(function () {

	var pageParam = location.search;
	var pageHash = location.hash;
	var jsonPath = '';
	var defaultNum = 64;
	var fadeSpeed = 500;
	var setArea = '#mainlist';
	var count = 1;
	var itemIDNum = '';

	if (!pageParam || !pageParam.match('word|type|area|tokusei|no_min')) {
		$('.wrap__result').hide();
		var jsonPath = '/zukan-api/api/search/?limit='
	}
	else {
		$('.wrap__result').show();
		var jsonPath = '/zukan-api/api/search/' + pageParam + '&limit='
	}

	defaultList();
	memoryID();

	function defaultList() {
		if (pageHash) {
			if (Cookies.get('itemLength')) {
				defaultNum = Cookies.get('itemLength');
			}
		} else {
			Cookies.remove('itemLength')
		}
		$.ajax({
			url: jsonPath + defaultNum + '&page=' + count,
			dataType: 'json',
		})
			.done(
				function (data) {
					$('.loading').remove();
					var dataLength = data.results.length;
					pageCountNum = data.paging.pageCount;
					var loadItemLength = $(setArea).find('.loadItem').length;
					if (dataLength > 0) {
						if (loadItemLength == 0) {
							if (dataLength < defaultNum) {
								// 64件以下の場合（ページ送りがない場合）
								console.log("64件以下の場合");
								console.log(data.paging);//リスト総数
								for (var i = 0; i < dataLength; i++) {
									$(`
									<li class="loadItem" id="item${data.results[i].zukan_no}">
										<a href="/detail/${data.results[i].zukan_no}" class="link__loadtItem">
											<figure class="img__loadItem is-loading">
												<img src="${data.results[i].image_s}" alt="${data.results[i].name}" class="img" loading="lazy">
											</figure>
											<p class="name__loadItem">${data.results[i].name}</p>
											</a>
											</li>
											`).appendTo(setArea).css({ opacity: '0' }).animate({ opacity: '1' }, fadeSpeed, function () {
										// $(this).find('.img__loadItem').removeClass("is-loading");
									});
									if (data.results[i].sub_name != "") {
										$('<span>（' + data.results[i].sub_name + '）</span>').appendTo('#item' + data.results[i].zukan_no + ' .name__loadItem');
									}
								}
								$('.loadItem:last').addClass("last");
							} else {
								// 64件以上の場合（ページ送りがある場合）
								for (var i = 0; i < defaultNum; i++) {
									$(`
									<li class="loadItem" id="item${data.results[i].zukan_no}">
										<a href="/detail/${data.results[i].zukan_no}" class="link__loadtItem">
											<figure class="img__loadItem is-loading">
												<img src="${data.results[i].image_s}" alt="${data.results[i].name}" class="img" loading="lazy">
											</figure>
											<p class="name__loadItem">${data.results[i].name}</p>
											</a>
											</li>
											`).appendTo(setArea).css({ opacity: '0' }).animate({ opacity: '1' }, fadeSpeed, function () {
										// $(this).find('.img__loadItem').removeClass("is-loading");
									});
									if (data.results[i].sub_name != "") {
										$('<span>（' + data.results[i].sub_name + '）</span>').appendTo('#item' + data.results[i].zukan_no + ' .name__loadItem');
									}
								}
								if ($('.loadItem').length != data.paging.count) {
									$('<li id="loading-more"><img src="/img/ball.svg" alt="" class="img"></li>').insertAfter(setArea);
								}
							}
						}
					} else {
						$('<li class="NoItem"><p>見つからなかったよ。ほかの条件で探してみよう。</p></li>').appendTo(setArea).css({ opacity: '0' }).animate({ opacity: '1' }, fadeSpeed);
					}
					if (pageHash) {
						if (Cookies.get('itemLength')) {
							itemIDNum = Cookies.get('itemID');
							$('#' + itemIDNum).ready(function () {
								var headerH = $('.wrap__header').height();
								var winH = $(window).height();
								winH = winH / 2;
								var positionOrg = $('#' + itemIDNum).offset().top;
								var position = Number(positionOrg - headerH);
								$("html,body").animate({
									scrollTop: position
								},
									{
										queue: false
									});
							});
						}
					}
					scrollList();
				}
			)
			.fail(function () {
				return false;
			})
	}

	function scrollList() {
		var remains;
		if (pageHash) {
			if (Cookies.get('itemLength')) {
				count = Number(Cookies.get('itemLength') / 64);
				remains = Number(Cookies.get('itemLength') % 64);
			} else {
				Cookies.remove('itemLength');
			}
		}
		if (!remains) {
			const node = document.querySelector('#loading-more'); // 監視したい要素
			const observer = new IntersectionObserver((entries) => {
				//console.log(entries); // このインスタンスで監視している要素のうち、受け取った変化が入ったオブジェクト
				for (const entry of entries) {
					if (entry.intersectionRatio <= 0) {
						return; // ルートと4割以上交差していなかった場合は監視を続行する
					}
					//console.log("API fetch")
					count++
					$.ajax({
						url: jsonPath + '64&page=' + count,
						dataType: 'json',
					})
						.done(function (data) {
							var dataURLCheck = jsonPath + '64&page=' + count;
							var datapageCount = data.paging.pageCount;
							//console.log(dataURLCheck);
							if (count <= datapageCount) {
								var dataLength = data.results.length;
								//console.log(dataLength);
								for (var i = 0; i < dataLength; i++) {
									$(`
									<li class="loadItem" id="item${data.results[i].zukan_no}">
										<a href="/detail/${data.results[i].zukan_no}" class="link__loadtItem">
											<figure class="img__loadItem is-loading">
												<img src="${data.results[i].image_s}" alt="${data.results[i].name}" class="img" loading="lazy">
											</figure>
											<p class="name__loadItem">${data.results[i].name}</p>
											</a>
											</li>
											`).appendTo(setArea).css({ opacity: '0' }).animate({ opacity: '1' }, fadeSpeed, function () {
										// $(this).find('.img__loadItem').removeClass("is-loading");
									});
									if (data.results[i].sub_name != "") {
										$('<span>（' + data.results[i].sub_name + '）</span>').appendTo('#item' + data.results[i].zukan_no + ' .name__loadItem');
									}
								}
								if (dataLength < 64) {
									$('.loadItem:last').addClass("last");
									$('#loading-more').remove();
								}
								if (location.search.match(/\?/)) {
									location.search.replace(/\?/, '');
								}
							}
						})

				}

			}, {
				root: null, // ビューポート
				rootMargin: '0px 0px 0px 0px', // 交差していると判断する領域の拡大
				threshold: 0
			});

			// 監視を開始
			if (node) {
				observer.observe(node);
			}


		}
	}

	function memoryID() {
		$(document).on('click', '.loadItem', function () {
			var thisID = $(this).prop('id');
			var scrollPos = $(window).scrollTop();
			$('.loadItem').ready(function () {
				var date = new Date();
				date.setTime(date.getTime() + (10 * 60 * 1000));
				var loadedItemLength = $('#mainlist').find('.loadItem').length;
				Cookies.set('itemLength', loadedItemLength, { expires: date, path: '/' });
				Cookies.set('itemID', thisID, { expires: date, path: '/' });
				//location.hash= thisID;
				$(window).scrollTop(scrollPos);
				window.history.pushState(null, null, location.search + "#" + thisID);
			})
		});
	}

});
