module.exports =
  # This will work on JavaScript and CoffeeScript files, but not in js comments.
  selector: '.source.poe'
  disableForSelector: '.source.poe .comment'

  # This will take priority over the default provider, which has a priority of 0.
  # `excludeLowerPriority` will suppress any providers with a lower priority
  # i.e. The default provider will be suppressed
  inclusionPriority: 1
  excludeLowerPriority: true

  blocks:  [
    {
      snippet: '##############################\n##  ${1:        Heading       }  ##\n##############################\n$2'
      displayText: '## Heading ##'
    },
    { snippet: 'Show\n  ${1:Filter}\n  ${2:Action}' },
    { snippet: 'Hide\n  ${1:Filter}' }
  ]

  filters: [
    { snippet: 'BaseType ${1:type}' },
    { snippet: 'Class ${1:class}' },
    { snippet: 'Rarity ${1:[operator]} ${2:rarity}' },
    { snippet: 'ItemLevel ${1:[operator]} ${2:level}' },
    { snippet: 'DropLevel ${1:[operator]} ${2:level}' },
    { snippet: 'Quality ${1:[operator]} ${2:quality}' },
    { snippet: 'Sockets ${1:[operator]} ${2:sockets}' },
    { snippet: 'LinkedSockets ${1:[operator]} ${2:links}' },
    { snippet: 'Height ${1:[operator]} ${2:height}' },
    { snippet: 'Width ${1:[operator]} ${2:width}' },
    { snippet: 'SocketGroup ${1:group}' }
  ]

  actions: [
    { snippet: 'SetBackgroundColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'SetBorderColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'SetTextColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'PlayAlertSound ${1:id} ${2:[volume]}' },
    { snippet: 'SetFontSize ${1:size}' }
  ]

  rarity: [
    { snippet: 'Normal' },
    { snippet: 'Magic' },
    { snippet: 'Rare' },
    { snippet: 'Unique' }
  ]

  operators: [
    { snippet: '>'},
    { snippet: '>='},
    { snippet: '='},
    { snippet: '<='},
    { snippet: '<'}
  ]

  classes: [
    { snippet: '"Life Flask"' },
    { snippet: '"Mana Flask"' },
    { snippet: '"Hybrid Flask"' },
    { snippet: 'Currency' },
    { snippet: 'Amulet' },
    { snippet: 'Ring' },
    { snippet: 'Claw' },
    { snippet: 'Dagger' },
    { snippet: 'Wand' },
    { snippet: '"One Hand Sword"' },
    { snippet: '"Thrusting One Hand Sword"' },
    { snippet: '"One Hand Axe"' },
    { snippet: '"One Hand Mace"' },
    { snippet: 'Bow' },
    { snippet: 'Staves' },
    { snippet: '"Two Hand Swords"' },
    { snippet: '"Two Hand Axes"' },
    { snippet: '"Two Hand Maces"' },
    { snippet: '"Active Skill Gems"' },
    { snippet: '"Support Skill Gems"' },
    { snippet: 'Quivers' },
    { snippet: 'Belt' },
    { snippet: 'Gloves' },
    { snippet: 'Boots' },
    { snippet: '"Body Armours"' },
    { snippet: 'Helmets' },
    { snippet: 'Shields' },
    { snippet: '"Stackable Currency"' },
    { snippet: '"Quest Items"' },
    { snippet: 'Sceptres' },
    { snippet: '"Utility Flasks"' },
    { snippet: 'Maps' },
    { snippet: '"Fishing Rods"' },
    { snippet: '"Map Fragments"' },
    { snippet: '"Hideout Doodads"' },
    { snippet: 'Microtransactions' },
    { snippet: 'Jewel' },
    { snippet: 'Card' }
  ]

  amulets: [
    { snippet: '"Jet Amulet"' },
    { snippet: '"Paua Amulet"' },
    { snippet: '"Coral Amulet"' },
    { snippet: '"Lapis Amulet"' },
    { snippet: '"Jade Amulet"' },
    { snippet: '"Amber Amulet"' },
    { snippet: '"Gold Amulet"' },
    { snippet: '"Turquoise Amulet"' },
    { snippet: '"Agate Amulet"' },
    { snippet: '"Citrine Amulet"' },
    { snippet: '"Onyx Amulet"' },
  ]

  belts: [
    { snippet: '"Chain Belt"' },
    { snippet: '"Rustic Sash"' },
    { snippet: '"Heavy Belt"' },
    { snippet: '"Leather Belt"' },
    { snippet: '"Golden Obi"' },
    { snippet: '"Cloth Belt"' },
    { snippet: '"Studded Belt"' },
  ]

  rings: [
    { snippet: '"Iron Ring"' },
    { snippet: '"Coral Ring"' },
    { snippet: '"Paua Ring"' },
    { snippet: '"Saphire Ring"' },
    { snippet: '"Topaz Ring"' },
    { snippet: '"Ruby Ring"' },
    { snippet: '"Gold Ring"' },
    { snippet: '"Golden Hoop"' },
    { snippet: '"Jet Ring"' },
    { snippet: '"Two-Stone Ring"' },
    { snippet: '"Moonstone Ring"' },
    { snippet: '"Diamond Ring"' },
    { snippet: '"Prismatic Ring"' },
    { snippet: '"Amethyst Ring"' },
    { snippet: '"Unset Ring"' },
  ]

  currency: [
    { snippet: '"Armourer\'s Scrap"' },
    { snippet: '"Blacksmith\'s Whetstone"' },
    { snippet: '"Blessed Orb"' },
    { snippet: '"Cartographer\s Chisel"' },
    { snippet: '"Chaos Orb"' },
    { snippet: '"Chromatic Orb"' },
    { snippet: '"Divine Orb"' },
    { snippet: '"Eternal Orb"' },
    { snippet: '"Exalted Orb"' },
    { snippet: '"Gemcutter\'s Prism"' },
    { snippet: '"Glassblower\'s Bauble"' },
    { snippet: '"Jeweller\'s Orb"' },
    { snippet: '"Mirror of Kalandra"' },
    { snippet: '"Orb of Alchemy"' },
    { snippet: '"Orb of Alteration"' },
    { snippet: '"Orb of Augmentation"' },
    { snippet: '"Orb of Chance"' },
    { snippet: '"Orb of Fusing"' },
    { snippet: '"Orb of Regret"' },
    { snippet: '"Orb of Scouring"' },
    { snippet: '"Orb of Transmutation"' },
    { snippet: '"Portal Scroll"' },
    { snippet: '"Regal Orb"' },
    { snippet: '"Scroll of Wisdom"' },
    { snippet: '"Vaal Orb"' }
  ]

  skills: [
    #strength/red Active
    { snippet: '"Abyssal Cry"' },
    { snippet: 'Anger' },
    { snippet: '"Animate Guardian"' },
    { snippet: 'Cleave' },
    { snippet: '"Decoy Totem"' },
    { snippet: 'Determination' },
    { snippet: '"Devouring Totem"' },
    { snippet: '"Dominating Blow"' },
    { snippet: '"Enduring Cry"' },
    { snippet: '"Flame Totem"' },
    { snippet: '"Glacial Hammer"' },
    { snippet: '"Ground Slam"' },
    { snippet: '"Heavy Strike"' },
    { snippet: '"Herald of Ash"' },
    { snippet: '"Ice Crash"' },
    { snippet: '"Immortal Call"' },
    { snippet: '"Infernal Blow"' },
    { snippet: '"Leap Slam"' },
    { snippet: '"Lightning Strike"' },
    { snippet: '"Molten Shell"' },
    { snippet: 'Punishment' },
    { snippet: '"Purity of Fire"' },
    { snippet: '"Rallying Cry"' },
    { snippet: 'Reckoning' },
    { snippet: '"Rejuvenation Totem"' },
    { snippet: '"Searing Bond"' },
    { snippet: '"Shield Charge"' },
    { snippet: '"Shockwave Totem"' },
    { snippet: '"Static Strike"' },
    { snippet: '"Summon Flame Golem"' },
    { snippet: 'Sweep' },
    { snippet: 'Vengeance' },
    { snippet: '"Vigilant Strike"' },
    { snippet: 'Vitality' },
    { snippet: '"Warlord\'s Mark"' },
    #strength/red support
    { snippet: '"Added Fire Damage"' },
    { snippet: 'Bloodlust' },
    { snippet: '"Blood Magic"' },
    { snippet: '"Cast on melee Kill"' },
    { snippet: '"Cast when Damage Taken"' },
    { snippet: '"Cold to Fire"' },
    { snippet: 'Empower' },
    { snippet: '"Endurance Charge on Melee Stun"' },
    { snippet: '"Fire Penetration"' },
    { snippet: 'Fortify' },
    { snippet: 'Generosity' },
    { snippet: '"Increased Burning Damage"' },
    { snippet: '"Increased Duration"' },
    { snippet: '"Iron Grip"' },
    { snippet: '"Iron Will"' },
    { snippet: '"Item Quantity"' },
    { snippet: 'Knockback' },
    { snippet: '"Less Duration"' },
    { snippet: '"Life Gain on Hit"' },
    { snippet: '"Life Leech"' },
    { snippet: '"Melee Damage on Full Life"' },
    { snippet: '"Melee Physical Damage"' },
    { snippet: '"Melee Splash"' },
    { snippet: 'Multistrike' },
    { snippet: '"Ranged Attack Totem"' },
    { snippet: '"Reduced Mana"' },
    { snippet: '"Spell Totem"' },
    { snippet: 'Stun' },
    { snippet: '"Weapon Elemental Damage"' },
    #strength/red vaal
    { snippet: '"Vaal Glacial Hammer"' },
    { snippet: '"Vaal Ground Slam"' },
    { snippet: '"Vaal Immortal Call"' },
    { snippet: '"Vaal Lightning Strike"' },
    { snippet: '"Vaal Molten Shell"' },
    #dexterity/green active
    { snippet: '"Animate WEapon"' },
    { snippet: '"Arctic Armour"' },
    { snippet: 'Barrage' },
    { snippet: '"Bear Trap"' },
    { snippet: '"Blink Arrow"' },
    { snippet: '"Blood Rage"' },
    { snippet: '"Burning Arrow"' },
    { snippet: 'Cyclone' },
    { snippet: 'Desecrate' },
    { snippet: '"Detonate Dead"' },
    { snippet: '"Double Strike"' },
    { snippet: '"Dual Strike"' },
    { snippet: '"Elemental Hit"' },
    { snippet: '"Ethereal knives"' },
    { snippet: '"Explosive Arrow"' },
    { snippet: '"Fire Trap"' },
    { snippet: '"Flicker Strike"' },
    { snippet: '"Freeze Mine"' },
    { snippet: 'Frenzy' },
    { snippet: '"Frost Blades"' },
    { snippet: 'Grace' },
    { snippet: 'Haste' },
    { snippet: 'Hatred' },
    { snippet: '"Herald of Ice"' },
    { snippet: '"Ice Shot"' },
    { snippet: '"Lightning Arrow"' },
    { snippet: '"Mirror Arrow"' },
    { snippet: '"Phase Run"' },
    { snippet: '"Poacher\'s Mark"' },
    { snippet: '"Poison Arrow"' },
    { snippet: '"Projectile Weakness"' },
    { snippet: 'Puncture' },
    { snippet: '"Purity of Ice"' },
    { snippet: '"Rain of Arrows"' },
    { snippet: 'Reave' },
    { snippet: 'Riposte' },
    { snippet: '"Smoke Mine"' },
    { snippet: '"Spectral Throw"' },
    { snippet: '"Split Arrow"' },
    { snippet: '"Summon Ice Golem"' },
    { snippet: '"Temporal Chains"' },
    { snippet: '"Tornado Shot"' },
    { snippet: '"Viper Strike"' },
    { snippet: '"Whirling Blades"' },
    { snippet: '"Wild Strike"' },
    #dexterity/green support
    { snippet: '"Added Cold Damage"' },
    { snippet: '"Additional Accuracy"' },
    { snippet: 'Blind' },
    { snippet: '"Block Chance Reduction"' },
    { snippet: '"Cast On Critical Strike"' },
    { snippet: '"Cast on Death"' },
    { snippet: 'Chain' },
    { snippet: '"Chance to Flee"' },
    { snippet: '"Cold Penetration"' },
    { snippet: '"Culling Strike"' },
    { snippet: 'Enhance' },
    { snippet: '"Faster Attacks"' },
    { snippet: '"Faster Projectiles"' },
    { snippet: 'Fork' },
    { snippet: '"Greater Multiple Projectiles"' },
    { snippet: 'Hypothermia' },
    { snippet: '"Ice Bite"' },
    { snippet: '"Lesser Multiple Projectiles"' },
    { snippet: '"Mana Leech"' },
    { snippet: '"Multiple Traps"' },
    { snippet: '"Physical Projectile Attack Damage"' },
    { snippet: 'Pierce' },
    { snippet: '"Point Blank"' },
    { snippet: '"Slower Projectiles"' },
    { snippet: 'Trap' },
    { snippet: '"Trap and Mine Damage"' },
    #dexterity/green vaal
    { snippet: '"Vaal Burning Arrow"' },
    { snippet: '"Vaal Cyclone"' },
    { snippet: '"Vaal Detonate Dead"' },
    { snippet: '"Vaal Double Strike"' },
    { snippet: '"Vaal Grace"' },
    { snippet: '"Vaal Haste"' },
    { snippet: '"Vaal Rain of Arrows"' },
    { snippet: '"Vall reave"' },
    { snippet: '"Vaal Spectral Throw"' },
    #intelligence/blue active
    { snippet: 'Arc' },
    { snippet: '"Arctiv Breath"' },
    { snippet: '"Assassin\'s Mark"' },
    { snippet: '"Ball Lightning"' },
    { snippet: '"Bone Offering"' },
    { snippet: 'Clarity' },
    { snippet: '"Cold Snap"' },
    { snippet: 'Conductivity' },
    { snippet: '"Conversion Trap"' },
    { snippet: 'Convocation' },
    { snippet: 'Discharge' },
    { snippet: 'Discipline' },
    { snippet: '"Elemental Weakness"' },
    { snippet: 'Enfeeble' },
    { snippet: '"Fire Nova Mine"' },
    { snippet: 'Fireball' },
    { snippet: 'Firestorm' },
    { snippet: '"Flame Dash"' },
    { snippet: '"Flame Surge"' },
    { snippet: 'Flameblast' },
    { snippet: 'Flammability' },
    { snippet: '"Flesh Offering"' },
    { snippet: '"Freezing Pulse"' },
    { snippet: 'Frostbite' },
    { snippet: '"Frost Wall"' },
    { snippet: '"Glacial Cascade"' },
    { snippet: '"Herald of Thunder"' },
    { snippet: '"Ice Nova"' },
    { snippet: '"Ice Spear"' },
    { snippet: 'Incinerate' },
    { snippet: '"Kinetic Blast"' },
    { snippet: '"Lightning Tendrils"' },
    { snippet: '"Lightning Trap"' },
    { snippet: '"Lightning warp"' },
    { snippet: '"Magma Orb"' },
    { snippet: '"Power Siphon"' },
    { snippet: '"Purity of Elements"' },
    { snippet: '"Purity of Lightning"' },
    { snippet: '"Raise Spectre"' },
    { snippet: '"Raise Zombie"' },
    { snippet: '"Righteous Fire"' },
    { snippet: '"Shock Nova"' },
    { snippet: 'Spark' },
    { snippet: '"Storm Call"' },
    { snippet: '"Summon Chaos Golem"' },
    { snippet: '"Summon Raging Spirit"' },
    { snippet: '"Summon Skeletons"' },
    { snippet: '"Tempest Shield"' },
    { snippet: 'Vulnerability' },
    { snippet: 'Wrath' },
    #intelligence/blue support
    { snippet: '"Added Chaos Damage"' },
    { snippet: '"Added Lightning Damage"' },
    { snippet: '"Cast when Stunned"' },
    { snippet: '"Chance to Ignite"' },
    { snippet: '"Concentrated Effect"' },
    { snippet: '"Curse on Hit"' },
    { snippet: '"Elemental Proliferation"' },
    { snippet: 'Enlighten' },
    { snippet: '"Faster Casting"' },
    { snippet: '"Increased Area of Effect"' },
    { snippet: '"Increased Critical Damage"' },
    { snippet: '"Increased Critical Strikes"' },
    { snippet: 'Innervate' },
    { snippet: '"Item Rarity"' },
    { snippet: '"Lightning Penetration"' },
    { snippet: '"Minion and Totem Elemental Resistance"' },
    { snippet: '"Minion Damage"' },
    { snippet: '"Minion Life"' },
    { snippet: '"Minion Speed"' },
    { snippet: '"Physical to Lightning"' },
    { snippet: '"Power Charge On Critical"' },
    { snippet: '"Remote Mine"' },
    { snippet: '"Spell Echo"' },
    #Intelligence/blue vaal
    { snippet: '"Vaal Arc"' },
    { snippet: '"Vaal Clarity"' },
    { snippet: '"Vaal Cold Snap"' },
    { snippet: '"Vaal Discipline"' },
    { snippet: '"Vaal Fireball"' },
    { snippet: '"Vaal Flameblast"' },
    { snippet: '"Vaal Ice Nova"' },
    { snippet: '"Vaal Lightning Trap"' },
    { snippet: '"Vaal Lightning Warp"' },
    { snippet: '"Vaal Power Siphon"' },
    { snippet: '"Vaal Righteous Fire"' },
    { snippet: '"Vaal Spark"' },
    { snippet: '"Vaal Storm Call"' },
    { snippet: '"Vaal Summon Skeletons"' },
    #white gems
    { snippet: '"Detonate Mines"' },
    { snippet: 'Portal' }
  ]

  maps: [
    { snippet: '"Crypt Map"' },
    { snippet: '"Desert Map"' },
    { snippet: '"Dunes Map"' },
    { snippet: '"Dungeon Map"' },
    { snippet: '"Grotto Map"' },
    { snippet: '"Pit Map"' },
    { snippet: '"Tropical Island Map"' },
    { snippet: '"Arcade Map"' },
    { snippet: '"Cemetery Map"' },
    { snippet: '"Channel Map"' },
    { snippet: '"Mountain Ledge Map"' },
    { snippet: '"Sewer Map"' },
    { snippet: '"Thicket Map"' },
    { snippet: '"Wharf Map"' },
    { snippet: '"The Apex of Sacrifice"' },
    { snippet: '"Ghetto Map"' },
    { snippet: '"Mud Geyser Map"' },
    { snippet: '"Museum Map"' },
    { snippet: '"Quarry Map"' },
    { snippet: '"Reef Map"' },
    { snippet: '"Spider Lair Map"' },
    { snippet: '"Vaal Pyramid Map"' },
    { snippet: '"Arena Map"' },
    { snippet: '"Overgrown Shrine Map"' },
    { snippet: '"Promenade Map"' },
    { snippet: '"Phantasmagoria Map"' },
    { snippet: '"Shore Map"' },
    { snippet: '"Spider Forest Map"' },
    { snippet: '"Tunnel Map"' },
    { snippet: '"Bog Map"' },
    { snippet: '"Coves Map"' },
    { snippet: '"Graveyard Map"' },
    { snippet: '"Pier Map"' },
    { snippet: '"Underground Sea Map"' },
    { snippet: '"Villa Map"' },
    { snippet: '"Arachnid Nest Map"' },
    { snippet: '"Catacomb Map"' },
    { snippet: '"Colonnade Map"' },
    { snippet: '"Dry Woods Map"' },
    { snippet: '"Strand Map"' },
    { snippet: '"Temple Map"' },
    { snippet: '"Jungle Valley Map"' },
    { snippet: '"Labyrinth Map"' },
    { snippet: '"Mine Map"' },
    { snippet: '"Torture Chamber Map"' },
    { snippet: '"Waste Pool Map"' },
    { snippet: '"Canyon Map"' },
    { snippet: '"Cells Map"' },
    { snippet: '"Dark Forest Map"' },
    { snippet: '"Dry Peninsula Map"' },
    { snippet: '"Orchard Map"' },
    { snippet: '"Arid Lake Map"' },
    { snippet: '"Gorge Map"' },
    { snippet: '"Malformation Map"' },
    { snippet: '"Residence Map"' },
    { snippet: '"Underground River Map"' },
    { snippet: '"Bazaar Map"' },
    { snippet: '"Necropolis Map"' },
    { snippet: '"Plateau Map"' },
    { snippet: '"Volcano Map"' },
    { snippet: '"Academy Map"' },
    { snippet: '"Crematorium Map"' },
    { snippet: '"Precinct Map"' },
    { snippet: '"Springs Map"' },
    { snippet: '"Arsenal Map"' },
    { snippet: '"Overgrown Ruin Map"' },
    { snippet: '"Shipyard Map"' },
    { snippet: '"Village Ruin Map"' },
    { snippet: '"The Alluring Abyss"' },
    { snippet: '"Courtyard Map"' },
    { snippet: '"Excavation Map"' },
    { snippet: '"Wasteland Map"' },
    { snippet: '"Waterways Map"' },
    { snippet: '"Maze Map"' },
    { snippet: '"Palace Map"' },
    { snippet: '"Shrine Map"' },
    { snippet: '"Vaal Temple Map"' },
    { snippet: '"Abyss Map"' },
    { snippet: '"Colosseum Map"' },
    { snippet: '"Core Map"' }
  ]

  excludedPrefixes: [
    #filters
    'Class',   'BaseType',      'ItemLevel',   'DropLevel', 'Quality', 'Rarity',
    'Sockets', 'LinkedSockets', 'SocketGroup', 'Height',    'Width',
    #actions
    'PlayAlertSound', 'SetBackgroundColor', 'SetBorderColor', 'SetFontSize', 'SetTextColor',
    #misc
    '[operator]'
  ]

  # Required: Return a promise, an array of suggestions, or null.
  getSuggestions: ({editor, bufferPosition, scopeDescriptor, prefix}) ->
    suggestions = []
    # The default prefix doesn't include the # symbol which is desired for headers.
    prefix = @getPrefix(editor, bufferPosition)

    if 'source.poe' == scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]
      suggestions = @blocks

    if 'show.block.poe' == scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]
      suggestions = @filters.concat @actions

    if 'hide.block.poe' == scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]
      suggestions = @filters

    if 'filter.rarity.poe' in scopeDescriptor.scopes and prefix not in @excludedPrefixes
      suggestions = @rarity

    if 'filter.class.poe' in scopeDescriptor.scopes and prefix not in @excludedPrefixes
      suggestions = @classes

    if 'filter.basetype.poe' in scopeDescriptor.scopes and prefix not in @excludedPrefixes
      suggestions = @amulets.concat @belts.concat @rings.concat @currency.concat @skills.concat @maps

    if /filter\..*\.operator/.test(scopeDescriptor.scopes[scopeDescriptor.scopes.length - 1]) or prefix == '[operator]'
      suggestions = @operators

    @setReplacementPrefix(prefix, suggestions)
    @orderSuggestions(prefix, suggestions)

    return suggestions

  getPrefix: (editor, bufferPosition) ->
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
    prefixRegex = /([\s]*([^\s]*))*$/
    prefixRegex.exec(line)?[2] or ''

  # Order the suggestions based on the prefix
  orderSuggestions: (prefix, suggestions) ->
    # There are more efficient sorting methods but this is simple and the task is quick
    suggestionSwapped = suggestions.length > 1
    upperPrefix = prefix.toUpperCase()
    while suggestionSwapped
      suggestionSwapped = false
      for index in [0...suggestions.length - 1]
        current = suggestions[index].snippet.toUpperCase().indexOf(upperPrefix)
        next = suggestions[index + 1].snippet.toUpperCase().indexOf(upperPrefix)
        if current >= 0 and next >= 0
          if current > next
            suggestionSwapped = true
            temp = suggestions[index]
            suggestions[index] = suggestions[index + 1]
            suggestions[index + 1] = temp
        else if next >= 0
          suggestionSwapped = true
          temp = suggestions[index]
          suggestions[index] = suggestions[index + 1]
          suggestions[index + 1] = temp

  # Fixes the suggestedPrefix.
  # There is an issue with the default function of using the prefix passed into getSuggestions,
  # so you have to define the replacementPrefix for each suggestion.
  setReplacementPrefix: (prefix, suggestions) ->
    for suggestion in suggestions
      suggestion.replacementPrefix = prefix

    return suggestions
