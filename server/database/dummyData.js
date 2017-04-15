// USERS
// **********************************************
const users = [
	{
		id: 1,
		password: 'a',
		username: 'winston',
		email: 'winston@gmail.com',
		first_name: 'Winston',
		last_name: 'Ku',
		type: 'artist',
		address: '944 Market St.',
	},
	{
		id: 2,
		password: 'a',
		username: 'alison',
		email: 'alison@gmail.com',
		first_name: 'Alison',
		last_name: 'Zhang',
		type: 'artist',
		address: '42 Wallaby Way',
	},
	{
		id: 3,
		password: 'a',
		username: 'anthony',
		email: 'anthony@gmail.com',
		first_name: 'Anthony',
		last_name: 'Bianco',
		type: 'user',
		address: '611 Mission St.',
	},
	{
		id: 4,
		password: 'a',
		username: 'bryan',
		email: 'bryan@gmail.com',
		first_name: 'Bryan',
		last_name: 'Nguyen',
		type: 'user',
		address: '666 Bluejay Way',
	}
];

// ARTWORKS
// *****************************
const artworks = [
	{
		id: 1,
		artist_id: 1,
		age: '1801\'s',
		estimated_price: 10001,
		art_name: 'Some flowers (1)',
		description: 'My name is Winston and I love flowers... A lot.',
		dimensions: '1200 x 538',
		image_url: 'https://s-media-cache-ak0.pinimg.com/originals/46/25/3b/46253b46982fe8f6e4094ce15f742c41.jpg',
	},
	{
		id: 2,
		artist_id: 1,
		age: '1802\'s',
		estimated_price: 15002,
		art_name: 'That\'s a Bridge (2)',
		description: 'I saw a bridge once, changed my life forever.',
		dimensions: '319 x 400',
		image_url: 'http://www.metmuseum.org/toah/images/h5/h5_29.100.113.jpg',
	},
	{
		id: 3,
		artist_id: 1,
		age: '1803\'s',
		estimated_price: 17803,
		art_name: 'Boats and Stuff at Dusk (3)',
		description: 'I rode in a boat once and got really sea sick. I am not a nautical person.',
		dimensions: '700 x 551',
		image_url: 'http://www.theartpostblog.com/wp-content/uploads/2016/05/monet-impressione-levar-del-sole.jpg',
	},
	{
		id: 4,
		artist_id: 1,
		age: '1804\'s',
		estimated_price: 11004,
		art_name: 'Some more flowers (4)',
		description: 'One time I was cooking and I mixed up flour with flower. That was a tasty macaroon.',
		dimensions: '800 x 609',
		image_url: 'http://www.artcyclopedia.org/art/claude-monet-lilies.jpg',
	},
	{
		id: 5,
		artist_id: 2,
		age: '1905\'s',
		estimated_price: 20005,
		art_name: 'Some lillies (5)',
		description: 'My name is Alison and I love lillies.',
		dimensions: '636 x 411',
		image_url: 'https://www.ibiblio.org/wm/paint/auth/monet/waterlilies/monet.wl-green.jpg',
	},
	{
		id: 6,
		artist_id: 2,
		age: '1906\'s',
		estimated_price: 16306,
		art_name: 'Poppies in Bloon (6)',
		description: 'I really wanted to see the super bloom this year but I missed it... again',
		dimensions: '900 x 674',
		image_url: 'http://www.claude-monet.com/images/paintings/poppies.jpg',
	},
	{
		id: 7,
		artist_id: 2,
		age: '1917\'s',
		estimated_price: 21007,
		art_name: 'Questionable Poppies (7)',
		description: 'Those are some precarious looking poppies',
		dimensions: '564 x 785',
		image_url: 'https://s-media-cache-ak0.pinimg.com/564x/ed/d0/0c/edd00c34430f2a627d443e92fc9c8627.jpg',
	},
	{
		id: 8,
		artist_id: 2,
		age: '1808\'s',
		estimated_price: 7808,
		art_name: 'Flowers in a Vase (8)',
		description: 'Those flowers are really in that vase. What\'s next? ' ,
		dimensions: '399 x 480',
		image_url: 'https://s-media-cache-ak0.pinimg.com/736x/95/d5/3b/95d53b6122ca5d4cfaaf1854e5092e87.jpg',
	}
];

// AUCTIONS
// **********************************

const auctions = [
	{
		id: 1,
		owner_id: 1,
		artwork_id: 1,
		start_date: '2017-04-09 14:27:07',
		end_date: '2017-03-05 14:27:07',
		start_price: 10000,
		buyout_price: 30000,
		current_bid_id: 2,
		current_bid: 12500,
		bid_counter: 2,
	}, 
	{
		id: 2,
		owner_id: 1,
		artwork_id: 2,
		start_date: '2017-04-09 14:27:07',
		end_date: '2017-05-08 11:45:07',
		start_price: 10000,
		buyout_price: 30000,
		current_bid_id: 3,
		current_bid: 15000,
		bid_counter: 1,
	}, 
	{
		id: 3,
		owner_id: 1,
		artwork_id: 3,
		start_date: '2017-04-09 14:27:07',
		end_date: '2017-05-11 10:27:07',
		start_price: 12500,
		buyout_price: 35000,
		current_bid_id: 4,
		current_bid: 17000,
		bid_counter: 1,
	}, 
	{
		id: 4,
		owner_id: 1,
		artwork_id: 4,
		start_date: '2017-04-09 14:27:07',
		end_date: '2017-02-05 14:27:07',
		start_price: 9000,
		buyout_price: 27000,
		current_bid_id: null,
		current_bid: null,
		bid_counter: 0,
	}, 
	{
		id: 5,
		owner_id: 2,
		artwork_id: 5,
		start_date: '2017-04-09 14:27:07',
		end_date: '2017-05-05 14:27:07',
		start_price: 17000,
		buyout_price: 35000,
		current_bid_id: null,
		current_bid: null,
		bid_counter: 0,
	}, 
	{
		id: 6,
		owner_id: 2,
		artwork_id: 6,
		start_date: '2017-04-09 14:27:07',
		end_date: '2017-05-05 14:27:07',
		start_price: 13000,
		buyout_price: 20000,
		current_bid_id: null,
		current_bid: null,
		bid_counter: 0,
	}
];

// BIDS
// ******************************
const bids = [
	{
		id: 1,
		bidder_id: 3,
		auction_id: 1,
		bid_date: '2017-04-10 08:27:07',
		bid_price: 12000,
	},
	{
		id: 2,
		bidder_id: 4,
		auction_id: 1,
		bid_date: '2017-04-10 09:27:07',
		bid_price: 12500,
	},
	{
		id: 3,
		bidder_id: 3,
		auction_id: 2,
		bid_date: '2017-04-10 10:27:07',
		bid_price: 15000,
	},
	{
		id: 4,
		bidder_id: 4,
		auction_id: 3,
		bid_date: '2017-04-10 11:27:07',
		bid_price: 17000,
	},
	{
		id: 5,
		bidder_id: 1,
		auction_id: 4,
		bid_date: '2017-01-01 11:30:00',
		bid_price: 10000
	}

];

const closedAuctions = [
  {
  	auction_id: 1,
  	winner: 4,
  	payment_status: 'unpaid'
  },
  {
  	auction_id: 4,
  	winner: 1,
  	payment_status: 'unpaid'
  }
]


module.exports = {
	users,
	artworks,
	auctions,
	bids,
	closedAuctions
};
