# Javascript Email AutoComplete
**Inline email auto-complete solution for html text inputs written in pure Javascript.**

Originally started with https://github.com/10w042/email-autocomplete . This needed to be ported into Vanilla JS. So I ended up rewriting it.

This script also supports forms that are hidden on page load, or added to the DOM later. To load this script, first include the plugin JS:


	<script src="dist/js-email-autocomplete.js"></script>


**Example usage (basic):**

     <script>
    	 var $elem = document.getElementById('user_email');
    	 EmailAutoComplete($elem);
    </script>

**Example usage (advanced):**

    <script>
    	 var $elem = document.getElementById('user_email');
    	 var options = {
				suggOpacity: "0.9",
				suggClass: "custom-classname", //default: "eac-sugg". your custom classname (optional)
				domains: ["example.com"] //additional domains (optional)
			 };
    	 EmailAutoComplete($elem, options);
    </script>



