import { Component } from '@angular/core'
import { instantMeiliSearch } from '../../../../src'

const searchClient = instantMeiliSearch(
  'https://integration-demos.meilisearch.com',
  'cfb43dd4058ba37e88b3aa4068b0de1f7ed617535eaab95a62cb70935a20da11'
)

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-app'
  config = {
    indexName: 'steam-video-games',
    searchClient,
  }
}
