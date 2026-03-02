<script>
export let text;
import { fly, fade } from 'svelte/transition';

const mod = {

	_feedback: '',
	setFeedback: message => {
		mod._feedback = message;
		setTimeout(() => mod._feedback = '', 2000);
	},

  error: () => mod.setFeedback('error'),

  copy: () => {
  	if (!navigator.clipboard)
  		return mod.error();

  	navigator.clipboard.writeText(text)
      .then(() => mod.setFeedback('copied'))
      .catch(mod.error)
  },

};
</script>

<button onclick={ mod.copy() }>{#if mod._feedback}
	<span in:fade>{ mod._feedback }</span>
{:else}
<span in:fade>copy</span>
{/if}</button>
