$(function() {
	Stripe.setPublishableKey('PUBLIC_KEY')

	$('#search').keyup(function(event) {
		event.preventDefault()

		var search_term = $(this).val()

		$.ajax({
			method: 'POST',
			url: '/api/search',
			data: {
				search_term
			},
			dataType: 'json',
			success: function(json) {
				var data = json.hits.hits.map(function(hit) {
					return hit
				})
				console.log(data)
				$('#searchResults').empty()
				for (var i = 0; i < data.length; i++) {
					var html = `
						<div class="col-md-4">
							<a href="/product/${data[i]._source._id}">
								<div class="thumbnail">
									<img src="${data[i]._source.image}">
									<div class="caption">
										<h3>${data[i]._source.name}</h3>
										<p>$${data[i]._source.price}</p>
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
			$form.get(0).submit()
		}
	}

	var $form = $('#payment-form')
	$form.submit(function(event) {
		$form.find('.submit').prop('disabled', true)

		Stripe.card.createToken($form, stripeResponseHandler)

		return false
	})
})
