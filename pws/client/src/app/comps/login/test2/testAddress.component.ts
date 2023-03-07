import { OnInit, Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'test-add',
  templateUrl: 'testAddress.component.html'
})
export class TestAddress implements OnInit {
  address;
  error;

  /* typeahead start */
  @ViewChild('searchEl')
  public searchElimentRef: ElementRef;
  ln = 7.809007;
  lt = 51.678418;

  public searchControl: FormControl;
  /* typeahead end */
  
  /* GOOGLE PLACE API HELP PAGE
    https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete
  */

  constructor(private mapApiLoader: MapsAPILoader, private ngZone: NgZone) { }

  ngOnInit() {
    /* typeahead start */
    this.searchControl = new FormControl();

    //let southWest = new google.maps.LatLng( 31.522607, -99.255332 );
    //let northEast = new google.maps.LatLng( 31.522607, -99.255332 );
    //let bangaloreBounds = new google.maps.LatLngBounds( southWest, northEast );


    console.log('***** this.mapApiLoader');
    this.mapApiLoader.load().then(() => {
      console.log('####### this.mapApiLoader');
      const autocomplete = new google.maps.places.Autocomplete(this.searchElimentRef.nativeElement, {
        types: [],

        //bounds: bangaloreBounds,
        componentRestrictions: { 'country': 'US', }
      });
      autocomplete.addListener('place_changed', () => {
        console.log('autocomplete.addListener');

        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          let address2 = [
            (place.address_components[0] && place.address_components[0].long_name || ' *** '),
            (place.address_components[1] && place.address_components[1].long_name || ''),
            (place.address_components[2] && place.address_components[2].long_name || '')
          ].join(' ');
          console.log('long  name: ', address2)

          var address = '';
          if (place.address_components) {
            address = [
              (place.address_components[0] && place.address_components[0].short_name || ' *** '),
              (place.address_components[1] && place.address_components[1].short_name || ''),
              (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
            console.log('short name: ', address)

            //this.searchElimentRef.nativeElement.children['place-icon'].src = place.icon;
            //this.searchElimentRef.nativeElement.children['place-name'].textContent = place.name;
            //this.searchElimentRef.nativeElement.children['place-address'].textContent = address;
            
            this.searchElimentRef.nativeElement.value = address;

          }

        })


      });



    })
    /* typeahead end */
  }


}