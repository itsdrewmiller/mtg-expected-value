

var tournament = function(playerSettings, tourneySettings) {

	var calculateEloWin = function(score, opponentScore) {
		return 1/(1+Math.pow(10, (opponentScore-score)/400));
	};

	var generateNormal = function(mean, stddev) {

		//This is the box-muller transform
		var x = 0, y = 0, rds;

		do {
			x = Math.random()*2-1;
			y = Math.random()*2-1;
			rds = x*x + y*y;
		}
		while (rds === 0 || rds > 1);

		var stdNormal = x*Math.sqrt(-2*Math.log(rds)/rds);

		return mean + stdNormal*stddev;
	};

	var canPair = function(player1, player2) {
		return (player1.played.indexOf(player2) === -1);
	};

	var pair = function(player1, player2) {
		player1.currentlyPlaying = player2;
		player2.currentlyPlaying = player1;
	};

	var unpair = function(player1, player2) {
		player1.currentlyPlaying = null;
		player2.currentlyPlaying = null;		
	};

	function tryPair(remaining) {

		if (remaining.length === 2) {
			if (canPair(remaining[0], remaining[1])) {
				pair(remaining[0], remaining[1]);
				return true;
			} else {
				return false;
			}
		}

		for (var i=0;i<remaining.length;i++) {
			for(var j=i+1;j<remaining.length;j++) {
				if (canPair(remaining[i], remaining[j])) {
					pair(remaining[i], remaining[j]);
					var newRemaining = remaining.slice(0);
					newRemaining.splice(j,1)[0];
					newRemaining.splice(i,1)[0];
					if (tryPair(newRemaining.slice(0))) {
						return true;
					}
					unpair(remaining[i], remaining[j]);
				}
			}
		}

		return false;
	}

	var simulateRound = function(players) {

		var remainingPlayers = players.slice(0);

		for (var i=0;i<players.length;i++) {
			var player1 = players[i];
			if (player1.currentlyPlaying) {			
				var player2 = player1.currentlyPlaying;
				player1.currentlyPlaying = null;
				player2.currentlyPlaying = null;
				player1.played.push(player2);
				player2.played.push(player1);

				var player1WinChance = calculateEloWin(player1.rating, player2.rating);

				if (Math.random() <= player1WinChance) {
					player1.score += 3;
					if (tourneySettings.isSingleElim) {
						remainingPlayers.splice(remainingPlayers.indexOf(player2), 1);
					}
				} else {
					player2.score += 3;
					if (tourneySettings.isSingleElim) {
						remainingPlayers.splice(remainingPlayers.indexOf(player1), 1);
					}
				}
			}
		}

		return remainingPlayers;
	};

	if (tourneySettings.isSingleElim) {
		var base2 = Math.log(tourneySettings.size) / Math.log(2);
		if (base2 !== Math.floor(base2)) {
			throw 'invalid size';
		}

	} else if (tourneySettings.size % 2) {
		throw 'invalid size';
	}
	
	var players = [{ name: 'me', rating: playerSettings.myElo, played: [], score: 0}];

	for (var i=1;i<tourneySettings.size;i++) {
		var elo = generateNormal(playerSettings.meanElo, playerSettings.stddevElo);
		elo = Math.max(elo, playerSettings.minElo);
		players.push({ name: i.toString(), rating: elo, played: [], score: 0});
	}

	var tourneyPlayers = players.slice(0);

	var playerSorter = function(player1, player2) { 
		return player1.score - player2.score; 
	};

	for (var round = 1; round<=tourneySettings.rounds;round++) {

		if (!tryPair(tourneyPlayers)) {
			throw 'Unable to pair';
		}

		tourneyPlayers = simulateRound(tourneyPlayers);

		if (!tourneySettings.isSingleElim) {
			tourneyPlayers.sort(playerSorter);
		}

	}

	return players;
};

var mtgFormats = function(packDetails) {

	var dgmPack = packDetails.dgmPack;
	var gtcPack = packDetails.gtcPack;
	var rtrPack = packDetails.rtrPack;
	var m13Pack = packDetails.m13Pack;

	var dgmDraftPackValue = packDetails.dgmDraftPackValue;
	var gtcDraftPackValue = packDetails.gtcDraftPackValue;
	var rtrDraftPackValue = packDetails.rtrDraftPackValue;

	var dgrDraftValue = dgmDraftPackValue + gtcDraftPackValue + rtrDraftPackValue;

	var dgmSealedPackValue = packDetails.dgmSealedPackValue;
	var gtcSealedPackValue = packDetails.gtcSealedPackValue;
	var rtrSealedPackValue = packDetails.rtrSealedPackValue;

	var m13DraftPackValue = packDetails.m13DraftPackValue;

	var m13SealedPackValue = packDetails.m13SealedPackValue;

	var eventTicket = packDetails.eventTicket;

	var dgrDraftEntryFee = dgmPack + gtcPack + rtrPack + eventTicket*2;
	var dgrSealedEntryFee = dgmPack*2 + gtcPack*2 + rtrPack*2 + eventTicket*2;

	var m13DraftEntryFee = m13Pack*3 + eventTicket*2;
	var m13SealedEntryFee = m13Pack*6 + eventTicket*2;

	var prizes;

	prizes = [];
	prizes[0] = 0;
	prizes[3] = 0;
	prizes[6] = dgmPack*2 + gtcPack*1 + rtrPack*1;
	prizes[9] = dgmPack*3 + gtcPack*3 + rtrPack*2;

	var dgr84 = {
		name: 'Ravnica Block 8-4',
		size: 8, 
		rounds: 3, 
		isSingleElim:true, 
		totalPackValue: dgrDraftValue,
		entryFee: dgrDraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = 0;
	prizes[6] = dgmPack*3 + gtcPack*2 + rtrPack*1;
	prizes[9] = dgmPack*2 + gtcPack*2 + rtrPack*2;

	var dgr84Split = {
		name: 'Ravnica Block 8-4 (split)',
		size: 8, 
		rounds: 3, 
		isSingleElim:true, 
		totalPackValue: dgrDraftValue,
		entryFee: dgrDraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = dgmPack + gtcPack;
	prizes[6] = dgmPack + gtcPack + rtrPack;
	prizes[9] = dgmPack*2 + gtcPack + rtrPack;

	var dgr4322 = {
		name: 'Ravnica Block 4-3-2-2',
		size: 8, 
		rounds: 3, 
		isSingleElim:true, 
		totalPackValue: dgrDraftValue,
		entryFee: dgrDraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = dgmPack;
	prizes[6] = dgmPack + gtcPack;
	prizes[9] = dgmPack + gtcPack + rtrPack;

	var dgrSwiss = {
		name: 'Ravnica Block Swiss',
		size: 8, 
		rounds: 3, 
		isSingleElim: false, 
		totalPackValue: dgrDraftValue,
		entryFee: dgrDraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = m13Pack;
	prizes[6] = m13Pack*2;
	prizes[9] = m13Pack*3;

	var m13Swiss = {
		name: 'Magic 2013 Swiss',
		size: 8, 
		rounds: 3, 
		isSingleElim: false, 
		totalPackValue: 3*m13DraftPackValue,
		entryFee: m13DraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = m13Pack*2;
	prizes[6] = m13Pack*3;
	prizes[9] = m13Pack*4;

	var m134322 = {
		name: 'Magic 2013 4-3-2-2',
		size: 8, 
		rounds: 3, 
		isSingleElim:true, 
		totalPackValue: 3*m13DraftPackValue,
		entryFee: m13DraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = 0;
	prizes[6] = m13Pack*6;
	prizes[9] = m13Pack*6;

	var m1384Split = {
		name: 'Magic 2013 8-4 (split)',
		size: 8, 
		rounds: 3, 
		isSingleElim:true, 
		totalPackValue: 3*m13DraftPackValue,
		entryFee: m13DraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = 0;
	prizes[6] = m13Pack*4;
	prizes[9] = m13Pack*8;

	var m1384 = {
		name: 'Magic 2013 8-4',
		size: 8, 
		rounds: 3, 
		isSingleElim:true, 
		totalPackValue: 3*m13DraftPackValue,
		entryFee: m13DraftEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = 0;
	prizes[6] = dgmPack + gtcPack + rtrPack;
	prizes[9] = dgmPack*2 + gtcPack*2 + rtrPack*2;
	prizes[12] = dgmPack*4 + gtcPack*4 + rtrPack*3;

	var dgrSealed = {
		name: 'Ravnica Block Sealed',
		size: 16, 
		rounds: 4, 
		isSingleElim:false, 
		totalPackValue: 2*dgmSealedPackValue + 2*gtcSealedPackValue + 2*rtrSealedPackValue,
		entryFee: dgrSealedEntryFee,
		prizes: prizes
	};

	prizes = [];
	prizes[0] = 0;
	prizes[3] = 0;
	prizes[6] = m13Pack*3;
	prizes[9] = m13Pack*6;
	prizes[12] = m13Pack*11;

	var m13Sealed = {
		name: 'Magic 2013 Sealed',
		size: 16, 
		rounds: 4, 
		isSingleElim:false, 
		totalPackValue: 6*m13SealedPackValue,
		entryFee: m13SealedEntryFee,
		prizes: prizes
	};

	return [
		dgrSwiss,
		dgr4322,
		dgr84Split,
		dgr84,
		dgrSealed,
		m13Swiss,
		m134322,
		m1384,
		m1384Split,
		m13Sealed
	];

};

var packSettings = {
	dgmPack: 2.2,
	gtcPack: 3.45,
	rtrPack: 3.2,
	m13Pack: 2.5,
	dgmDraftPackValue: 1.8,
	gtcDraftPackValue: 1,
	rtrDraftPackValue: 1.2,
	dgmSealedPackValue: 1.5,
	gtcSealedPackValue: 0.7,
	rtrSealedPackValue: 0.8,
	m13DraftPackValue: 1,
	m13SealedPackValue: 0.8,
	eventTicket: 1
};

