$(function() {
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
})
