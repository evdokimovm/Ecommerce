$(function() {
	Stripe.setPublishableKey('PUBLIC_KEY')

	var opts = {
		lines: 13, // The number of lines to draw
		length: 28, // The length of each line
		width: 14, // The line thickness
		radius: 42, // The radius of the inner circle
		scale: 1, // Scales overall size of the spinner
		corners: 1, // Corner roundness (0..1)
		color: '#000', // #rgb or #rrggbb or array of colors
		opacity: 0.25, // Opacity of the lines
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		className: 'spinner', // The CSS class to assign to the spinner
		top: '50%', // Top position relative to parent
		left: '50%', // Left position relative to parent
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		position: 'absolute' // Element positioning
	}

	$('#search').keyup(function(event) {
		event.preventDefault()

		var search_term = $(this).val()

		$.ajax({
			method: 'POST',
			url: '/instant/search',
			data: {
				search_term
			},
			dataType: 'json',
			success: function(json) {
				var data = json.map(function(hit) {
					return hit
				})
				$('#searchResults').empty()
				for (var i = 0; i < data.length; i++) {
					var html = `
						<div class="col-md-4">
							<a href="/product/${data[i]._id}">
								<div class="thumbnail">
									<img src="${data[i].image}">
									<div class="caption">
										<h3>${data[i].name}</h3>
										<p>${data[i].category.name}</p>
										<p>$${data[i].price}</p>
									</div>
								</div>
							</a>
						</div>
					`
					$('#searchResults').append(html)
				}
			},
			error: function(err) {
				console.log(err)
			}
		})
	})

	$('#plus').on('click', function(event) {
		event.preventDefault()
		var priceValue = parseFloat($('#priceValue').val())
		var quantity = parseInt($('#quantity').val())

		priceValue += parseFloat($('#priceHidden').val())
		quantity += 1

		$('#quantity').val(quantity)
		$('#priceValue').val(priceValue.toFixed(2))
		$('#total').html(quantity)
	})

	$('#minus').on('click', function(event) {
		event.preventDefault()
		var priceValue = parseFloat($('#priceValue').val())
		var quantity = parseInt($('#quantity').val())

		if(quantity > 1) {
			quantity -= 1
			priceValue -= parseFloat($('#priceHidden').val())
		} else if(quantity == 1) {
			quantity = 1
			priceValue = parseFloat($('#priceHidden').val())
		}

		$('#quantity').val(quantity)
		$('#priceValue').val(priceValue.toFixed(2))
		$('#total').html(quantity)
	})

	function stripeResponseHandler(status, response) {
		var $form = $('#payment-form')

		if (response.error) {
			$form.find('.payment-errors').text(response.error.message)
			$form.find('.submit').prop('disabled', false)
		} else {
			var token = response.id
			$form.append($('<input type="hidden" name="stripeToken">').val(token))

			var spinner = new Spinner(opts).spin()
			$('#loading').append(spinner.el)

			$form.get(0).submit()
		}
	}

	var $form = $('#payment-form')
	$form.submit(function(event) {
		$form.find('.submit').prop('disabled', true)

		Stripe.card.createToken($form, stripeResponseHandler)

		return false
	})

	var button = document.getElementById("copy")
	var input = document.getElementById("token")

	button.addEventListener("click", function(event) {
		event.preventDefault()
		input.select()
		document.execCommand("copy")
	})

})
