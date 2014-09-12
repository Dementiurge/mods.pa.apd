/* APD - Advanced Planet Details
------------------------------------ */

model.apd = (function () {
    var apd = {};

    function planetProperty(index, property) {
        var x;
        if (typeof model.system().planets[index] === "object") {
            if (typeof model.system().planets[index].generator === "object") {
                x = model.system().planets[index].generator[property];
                return x;
            }
            if (typeof model.system().planets[index].planet === "object") {
                x = model.system().planets[index].planet[property];
                return x;
            }
        }
        else { return false; }
    }

    apd.currentPlanetIndex = ko.observable(-1);
    apd.bShowDetailPanel = ko.observable(false);
    apd.bShowPlanetDetails = ko.observable(false);

    apd.toggleDetailPanel = function () {
        apd.bShowDetailPanel(!apd.bShowDetailPanel());
    };

    apd.setCurrentPlanet = function(args, data, event) {
        var index = (typeof args === "function") ? args() : args,
        pin = (typeof index === "number") ? index : Number(index);

        if (typeof model.system().planets[pin] === "object" && typeof event === "object" && event.type === "mouseover") {
            apd.currentPlanetIndex(pin);
            apd.bShowPlanetDetails(true);
        }
        else {
            apd.bShowPlanetDetails(false);
        }
    };

    apd.startingBool = function (index) {
        if (model.systemIsEmpty()) { return false; }
        if (model.system().planets[index].starting_planet != undefined) { return true; }
        return false;
    };

    apd.planetNameString = function (value) {
        return value || "Unnamed Planet";
    };
    apd.sizeString = function (data) {
        var sizeVar = data || "N/A";
        return model.planetSizeClass(sizeVar);
    };
    apd.areaString = function (data) {
        var radiusVar = data || "N/A";
        if (typeof radiusVar === "string") { return radiusVar; }
        radiusVar = 4 * radiusVar * radiusVar * Math.PI;
        radiusVar = radiusVar / 1000000; //from m² to km²
        return radiusVar.toFixed(2);
    };

    apd.dataString = function (index, data) {
        var dataVar = "N/A"; //Only one variable.
        if (model.systemIsEmpty()) { return "N/A"; }
        switch (data) {
            case "area":
                dataVar = planetProperty(index, "radius");
                if (!dataVar) { return "N/A"; }
                dataVar = 4 * dataVar * dataVar * Math.PI;
                dataVar = dataVar / 1000000; //from m² to km²
                return dataVar.toFixed(2);
            case "biomeimage":
                dataVar = planetProperty(index, "biome") || "unknown";
                dataVar = ((dataVar === "earth" || dataVar === "tropical") && false) ? "ice" : dataVar;
                return "/main/shared/img/planets/" + dataVar + "-big.png";
            case "biomesize":
                dataVar = planetProperty(index, "radius");
                if (!dataVar) { return "56px"; }
                dataVar = Math.floor(Math.min(56, Math.max(8, (dataVar / 20))));
                return dataVar.toString() + "px";
            case "name":
                dataVar = typeof model.system().planets[index] === "object" ? model.system().planets[index].name : "???";
                return String(dataVar);
            case "thrusters":
                dataVar = typeof model.system().planets[index] === "object" ? model.system().planets[index].required_thrust_to_move : 0;
                if (typeof dataVar !== "number") { return "N/A"; }
                else {
                    return dataVar.toString();
                }
            default:
                dataVar = planetProperty(index, data);
                return String(dataVar);
        }
    };

    apd.biomeImageSource = function (index) {
        var biomeVar = planetProperty(index, "biome") || "unknown",
        ice = biomeVar === 'earth' && planetProperty(index, "temperature") <= 10, //Temps of -0.5 are no longer possible.
        s = ice ? 'ice' : biomeVar || "unknown";

        return '/main/shared/img/planets/' + s + '-big.png';
    };
    apd.biomeImageSize = function (index) {
        var radiusVar = planetProperty(index, "radius") || 1200,
        pixels = Math.floor(Math.min(56, Math.max(8, (radiusVar / 20)))); //Fixed 14/02/25

        return pixels.toString() + "px";
    };

    return apd;
}());

$((function () { // BEGIN ====MODIFY DOM====
var newAllPlanets = '<div class="all-planets">\
<!-- ko foreach: planetBiomes -->\
<div class="each-planet" style="position:relative;display:inline-block;" data-bind="event: { mouseover: $root.apd.setCurrentPlanet.bind($data, $index()), mouseout: $root.apd.bShowPlanetDetails(false) }">\
<img style="height: 20px; width: 20px;" data-bind="attr: { src: \'coui://ui/main/shared/img/planets/small/\' + $data + \'.png\' }" />\
<img style="position:absolute;bottom:0px;right:0px;" src="../live_game/img/planet_list_panel/icon_engine_status_active.png"\
data-bind="visible: $root.apd.dataString($index(), \'thrusters\') > 0" width="10" />\
<div class="apd_details" style="position:absolute;border-image:url(coui://ui/main/shared/img/panel/img_menu_panel_secondary.png) 14 22 22 22;border-width:14px 22px 22px 22px;box-shadow: inset 1000px 1000px 1000px 1000px #1a1a1a;z-index:1;"\
data-bind="visible: $root.apd.currentPlanetIndex() === $index() && $root.apd.bShowPlanetDetails">\
<div><img data-bind="attr: { src: $root.apd.dataString($index(), \'biomeimage\'), height: $root.apd.dataString($index(), \'biomesize\'), width: $root.apd.dataString($index(), \'biomesize\') }" /></div>\
<div style="white-space:nowrap;"><span class="input_label">Name: </span><span data-bind="text: $root.apd.dataString($index(), \'name\')">NAME</span><br>\
<span class="input_label">Area: </span><span data-bind="text: $root.apd.dataString($index(), \'area\')">AREA</span><span>km&sup2;</span><br>\
<span class="input_label">Delta-V: </span><span data-bind="text: $root.apd.dataString($index(), \'thrusters\')">N/A</span> \
<img src="../live_game/img/planet_list_panel/icon_engine_status_active.png" data-bind="visible: $root.apd.dataString($index(), \'thrusters\') > 0" />\
<img src="../live_game/img/planet_list_panel/icon_engine_status_empty.png" data-bind="visible: $root.apd.dataString($index(), \'thrusters\') == 0" /></div>\
<div class="input_label" data-bind="visible: $root.apd.dataString($index(), \'starting_planet\') === true">\
<loc data-i18n="new_game:starting_planet.message" desc="">STARTING PLANET</loc></div>\
</div><!-- APD Details -->\
</div><!-- Each-planet -->\
<!-- /ko -->\
</div>',
newPlanetTable = '<div class="apd_table" style="position:absolute;top:90px;left:355px;max-width:808px;display:none;padding: 10px 0 0 10px;border-image: url(\'img/panel_secondary.png\') 33 46 46 33 fill;border-width: 8px 32px 36px 12px;z-index:15;" data-bind="visible: apd.bShowDetailPanel">\
<div style="margin:-12px -16px 16px 0px;"><div class="btn_win btn_win_close" style="float:right;" data-bind="click: apd.bShowDetailPanel(0)"></div></div>\
<div class="apd_table_planets_cont" style="max-height:339px;padding:5px;white-space:nowrap;overflow:auto;-webkit-box-shadow:inset 0 0 10px #000;" data-bind="foreach: system().planets">\
<div class="apd_table_planet" style="min-width:144px;display:inline-block;border:1px solid #222;margin:1px;padding:4px;">\
<div class="apd_planet_header" style="height:1.2em;"><div class="input_label" data-bind="visible: $data.starting_planet == true"><loc data-i18n="new_game:starting_planet.message" desc="">STARTING PLANET</loc></div></div>\
<div class="apd_planet_icon" style="position:relative;display:table;height:56px;width:56px;margin-left:auto;margin-right:auto;">\
<div style="display:table-cell;height:56px;width:100%;text-align:center;vertical-align:middle;"><img data-bind="attr: { src: $root.apd.biomeImageSource($index()), height: $root.apd.biomeImageSize($index()), width: $root.apd.biomeImageSize($index()) }" /></div>\
<img style="position:absolute;bottom:0px;right:0px;" src="coui://ui/main/shared/img/planets/icon_thruster.png" data-bind="visible: required_thrust_to_move > 0" width="40"/>\
<span style="position:absolute;bottom:0px;right:4px;font-size:75%;" data-bind="text: required_thrust_to_move, visible: required_thrust_to_move > 0"></span>\
</div><!-- APD Planet Icon -->\
<div style="text-transform:uppercase;" data-bind="text: $root.apd.planetNameString(name)"></div><div style="margin-bottom:1.0em;">\
    <span class="input_label">Size:</span><span style="text-transform:uppercase;" data-bind="text: $root.apd.sizeString(planet.radius)"></span>\
<br><span class="input_label">Surf. Area:</span><span style="text-transform:uppercase;" data-bind="text: $root.apd.areaString(planet.radius)"></span><span>km&sup2;</span>\
<br><span class="input_label">Base Radius:</span><span style="text-transform:uppercase;" data-bind="text: planet.radius"></span><span>m</span>\
<br><span class="input_label">Random Seed:</span><span style="text-transform:uppercase;" data-bind="text: planet.seed"></span>\
<br><span class="input_label">Height Range:</span><span style="text-transform:uppercase;" data-bind="text: planet.heightRange"></span>\
<br><span class="input_label">Water Height:</span><span style="text-transform:uppercase;" data-bind="text: planet.waterHeight"></span>\
<br><span class="input_label">Temperature:</span><span style="text-transform:uppercase;" data-bind="text: planet.temperature"></span>\
<br><span class="input_label">Metal Density:</span><span style="text-transform:uppercase;" data-bind="text: planet.metalDensity"></span><span>%</span>\
<br><span class="input_label">Metal Clusters:</span><span style="text-transform:uppercase;" data-bind="text: planet.metalClusters"></span><span>%</span>\
<br></div></div>\
</div><!-- Planets Container -->\
</div>',
showDetailsButton = '<div class="btn_std_gray btn_new_system" data-bind="click: apd.toggleDetailPanel"><div class="btn_std_label">Details</div></div>';

if ("system" in model) {
    $(".section_content_table").first().prepend(newPlanetTable);
    $("#system .system-controls").append(showDetailsButton);
};
if ("planetBiomes" in model) { $("#system div.all-planets").replaceWith(newAllPlanets) };
})()); //END ====MODIFY DOM====